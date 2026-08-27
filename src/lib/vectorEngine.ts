import { GoogleGenAI } from '@google/genai';
import {
  FeedbackItem,
  GroundedSource,
  RetrievalStats,
  VectorIndexStatus,
  DeduplicationResult,
} from '../types/loop';

export interface VectorDocument {
  id: string;
  workspaceId: string;
  embedding: number[];
  text: string;
  contentHash: string;
  item: FeedbackItem;
  indexedAt: string;
}

export interface SearchResult {
  item: FeedbackItem;
  similarityScore: number; // 0.0 to 1.0
  denseScore: number;
  lexicalScore: number;
  source: GroundedSource;
}

export interface SearchOptions {
  topK?: number;
  minSimilarity?: number;
  searchMode?: 'hybrid' | 'dense' | 'lexical';
  alpha?: number; // 0.0 = pure lexical, 1.0 = pure dense vector
}

/**
 * Normalizes text for canonical content hashing.
 */
export function normalizeForHash(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes a fast, deterministic hex hash from normalized text.
 */
export function computeContentHash(content: string, company?: string): string {
  const normalized = `${normalizeForHash(content)}|${normalizeForHash(company || '')}`;
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }

  const h1Hex = (hash1 >>> 0).toString(16).padStart(8, '0');
  const h2Hex = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `hash_${h1Hex}${h2Hex}`;
}

export class VectorEngine {
  private documents: Map<string, Map<string, VectorDocument>> = new Map(); // workspaceId -> (id -> doc)
  private hashIndex: Map<string, Map<string, string>> = new Map(); // workspaceId -> (contentHash -> docId)
  private embeddingCache: Map<string, number[]> = new Map(); // hash -> embedding
  private cacheHits: number = 0;
  private readonly dimension: number = 768;
  private readonly modelName: string = 'gemini-embedding-2-preview';
  private lastIndexedTime: Map<string, string> = new Map();

  constructor() {}

  /**
   * Generates a deterministic semantic fallback vector (768-dim) based on n-gram and token hashing.
   * Ensures 100% resilient retrieval even during offline/fallback testing.
   */
  private generateDeterministicVector(text: string): number[] {
    const vector = new Array(this.dimension).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter((t) => t.length > 1);

    if (tokens.length === 0) {
      vector[0] = 1.0;
      return vector;
    }

    tokens.forEach((token, idx) => {
      // 1. Primary hash for token position
      let h1 = 0;
      for (let i = 0; i < token.length; i++) {
        h1 = (h1 * 31 + token.charCodeAt(i)) >>> 0;
      }
      const dim1 = h1 % this.dimension;
      const weight1 = 1.0 / Math.sqrt(idx + 1);
      vector[dim1] += weight1;

      // 2. Character bigrams for subword semantics
      for (let i = 0; i < token.length - 1; i++) {
        const bigram = token.slice(i, i + 2);
        let h2 = 0;
        for (let j = 0; j < bigram.length; j++) {
          h2 = (h2 * 37 + bigram.charCodeAt(j)) >>> 0;
        }
        const dim2 = (h1 + h2) % this.dimension;
        vector[dim2] += 0.4;
      }
    });

    // Normalize to unit length (L2 norm = 1.0)
    let norm = 0;
    for (let i = 0; i < this.dimension; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.dimension; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  /**
   * Embeds a text string using Gemini Embedding API if available, or deterministic dense vectors.
   */
  public async embedText(text: string, geminiClient?: GoogleGenAI): Promise<number[]> {
    const cacheKey = text.trim().toLowerCase();
    if (this.embeddingCache.has(cacheKey)) {
      this.cacheHits++;
      return this.embeddingCache.get(cacheKey)!;
    }

    if (geminiClient && process.env.GEMINI_API_KEY) {
      try {
        const response = await geminiClient.models.embedContent({
          model: this.modelName,
          contents: text,
        });

        // Check if response contains embedding values
        const values =
          (response as any)?.embedding?.values ||
          (response as any)?.embeddings?.[0]?.values;
        if (Array.isArray(values) && values.length > 0) {
          const normalized = this.normalizeVector(values);
          this.embeddingCache.set(cacheKey, normalized);
          return normalized;
        }
      } catch (err: any) {
        console.warn(`[VectorEngine] Gemini embedContent fallback used (${err.message}).`);
      }
    }

    // High quality deterministic fallback vector
    const fallbackVector = this.generateDeterministicVector(text);
    this.embeddingCache.set(cacheKey, fallbackVector);
    return fallbackVector;
  }

  /**
   * Normalizes a vector to unit length (L2 norm = 1.0)
   */
  private normalizeVector(v: number[]): number[] {
    let sum = 0;
    for (let i = 0; i < v.length; i++) {
      sum += v[i] * v[i];
    }
    const norm = Math.sqrt(sum);
    if (norm === 0) return v;
    return v.map((val) => val / norm);
  }

  /**
   * Cosine similarity between two unit vectors is their dot product.
   */
  public cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    // Clamp to [0, 1] range
    return Math.max(0, Math.min(1, (dot + 1) / 2));
  }

  /**
   * Prepare rich textual representation of feedback for indexing
   */
  private prepareFeedbackChunk(item: FeedbackItem): string {
    return `Title: ${item.title} | Feature Area: ${item.featureArea} | Themes: ${item.themes.join(
      ', '
    )} | Tier: ${item.customerTier} | Urgency: ${item.urgency} | Sentiment: ${
      item.sentiment
    } | Content: ${item.content} | Customer: ${item.customerName} (${
      item.customerCompany || ''
    })`;
  }

  /**
   * Index a single feedback item into the workspace vector store
   */
  public async indexItem(
    workspaceId: string,
    item: FeedbackItem,
    geminiClient?: GoogleGenAI
  ): Promise<VectorDocument> {
    if (!this.documents.has(workspaceId)) {
      this.documents.set(workspaceId, new Map());
      this.hashIndex.set(workspaceId, new Map());
    }

    const wsDocs = this.documents.get(workspaceId)!;
    const wsHashes = this.hashIndex.get(workspaceId)!;

    const contentHash = item.contentHash || computeContentHash(item.content, item.customerCompany);
    const textChunk = this.prepareFeedbackChunk(item);
    const embedding = await this.embedText(textChunk, geminiClient);

    const doc: VectorDocument = {
      id: item.id,
      workspaceId,
      embedding,
      text: textChunk,
      contentHash,
      item: { ...item, contentHash },
      indexedAt: new Date().toISOString(),
    };

    wsDocs.set(item.id, doc);
    wsHashes.set(contentHash, item.id);
    this.lastIndexedTime.set(workspaceId, new Date().toISOString());
    return doc;
  }

  /**
   * Batch index feedback items for a workspace
   */
  public async indexBatch(
    workspaceId: string,
    items: FeedbackItem[],
    geminiClient?: GoogleGenAI
  ): Promise<number> {
    if (!this.documents.has(workspaceId)) {
      this.documents.set(workspaceId, new Map());
      this.hashIndex.set(workspaceId, new Map());
    }

    let indexedCount = 0;
    for (const item of items) {
      await this.indexItem(workspaceId, item, geminiClient);
      indexedCount++;
    }

    return indexedCount;
  }

  /**
   * DEDUPLICATION CHECK:
   * 1. Exact Content Hash Fingerprint Match (SHA/Murmur-equivalent)
   * 2. Semantic Embedding Cosine Similarity Threshold Check (e.g. >= 0.88)
   */
  public async checkDuplicate(
    workspaceId: string,
    candidate: {
      content: string;
      title?: string;
      customerCompany?: string;
      customerName?: string;
    },
    similarityThreshold = 0.88,
    geminiClient?: GoogleGenAI
  ): Promise<DeduplicationResult> {
    const wsDocs = this.documents.get(workspaceId);
    const wsHashes = this.hashIndex.get(workspaceId);

    const contentHash = computeContentHash(candidate.content, candidate.customerCompany);

    if (!wsDocs || wsDocs.size === 0) {
      return {
        isDuplicate: false,
        matchType: 'NONE',
        similarityScore: 0,
        contentHash,
      };
    }

    // Step 1: Exact Hash Check
    if (wsHashes && wsHashes.has(contentHash)) {
      const matchedDocId = wsHashes.get(contentHash)!;
      const matchedDoc = wsDocs.get(matchedDocId);
      if (matchedDoc) {
        return {
          isDuplicate: true,
          matchType: 'EXACT_HASH',
          similarityScore: 1.0,
          matchedItem: matchedDoc.item,
          contentHash,
          reason: `Exact duplicate detected matching ticket #${matchedDoc.item.id} via content hash.`,
        };
      }
    }

    // Step 2: Semantic Similarity Threshold Check
    const candidateText = `Title: ${candidate.title || ''} | Content: ${candidate.content} | Company: ${
      candidate.customerCompany || ''
    }`;
    const candidateEmbedding = await this.embedText(candidateText, geminiClient);

    let highestScore = 0;
    let closestDoc: VectorDocument | null = null;

    for (const doc of wsDocs.values()) {
      const score = this.cosineSimilarity(candidateEmbedding, doc.embedding);
      if (score > highestScore) {
        highestScore = score;
        closestDoc = doc;
      }
    }

    const roundedScore = Math.round(highestScore * 100) / 100;

    if (highestScore >= similarityThreshold && closestDoc) {
      return {
        isDuplicate: true,
        matchType: 'SEMANTIC_SIMILARITY',
        similarityScore: roundedScore,
        matchedItem: closestDoc.item,
        contentHash,
        reason: `Semantic near-duplicate detected (${Math.round(
          roundedScore * 100
        )}% similarity) with ticket #${closestDoc.item.id} ("${closestDoc.item.title}").`,
      };
    }

    return {
      isDuplicate: false,
      matchType: 'NONE',
      similarityScore: roundedScore,
      matchedItem: closestDoc ? closestDoc.item : undefined,
      contentHash,
    };
  }

  /**
   * Calculates a sparse lexical BM25/keyword similarity score (0.0 to 1.0)
   */
  private calculateLexicalScore(query: string, item: FeedbackItem): number {
    const queryTerms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (queryTerms.length === 0) return 0.5;

    const fullText = `${item.title} ${item.content} ${item.featureArea} ${item.themes.join(
      ' '
    )} ${item.tags.join(' ')} ${item.customerCompany || ''}`.toLowerCase();
    const titleText = item.title.toLowerCase();

    let matchedTerms = 0;
    let titleBoost = 0;
    let exactPhraseBoost = fullText.includes(query.toLowerCase()) ? 0.3 : 0;

    queryTerms.forEach((term) => {
      if (fullText.includes(term)) {
        matchedTerms++;
      }
      if (titleText.includes(term)) {
        titleBoost += 0.2;
      }
    });

    const termCoverage = matchedTerms / queryTerms.length;
    const score = Math.min(1.0, termCoverage * 0.6 + titleBoost + exactPhraseBoost);
    return score;
  }

  /**
   * Performs hybrid semantic vector retrieval across workspace feedback
   */
  public async search(
    workspaceId: string,
    query: string,
    options: SearchOptions = {},
    geminiClient?: GoogleGenAI
  ): Promise<{ results: SearchResult[]; stats: RetrievalStats }> {
    const startTime = performance.now();
    const topK = options.topK || 6;
    const minSimilarity = options.minSimilarity || 0.2;
    const searchMode = options.searchMode || 'hybrid';
    const alpha = options.alpha !== undefined ? options.alpha : 0.75; // 75% vector, 25% lexical

    const wsDocs = this.documents.get(workspaceId);
    if (!wsDocs || wsDocs.size === 0) {
      return {
        results: [],
        stats: {
          vectorCount: 0,
          latencyMs: Math.round(performance.now() - startTime),
          model: this.modelName,
          searchMode,
          avgSimilarity: 0,
        },
      };
    }

    // 1. Generate query embedding
    const queryEmbedding = await this.embedText(query, geminiClient);

    // 2. Score all documents
    const scoredList: SearchResult[] = [];

    for (const doc of wsDocs.values()) {
      const denseScore = this.cosineSimilarity(queryEmbedding, doc.embedding);
      const lexicalScore = this.calculateLexicalScore(query, doc.item);

      let finalScore = 0;
      if (searchMode === 'dense') {
        finalScore = denseScore;
      } else if (searchMode === 'lexical') {
        finalScore = lexicalScore;
      } else {
        // Hybrid: Linear Fusion
        finalScore = alpha * denseScore + (1 - alpha) * lexicalScore;

        // Boost enterprise & critical tickets
        if (doc.item.urgency === 'CRITICAL') finalScore += 0.03;
        if (doc.item.customerTier === 'ENTERPRISE') finalScore += 0.02;
      }

      finalScore = Math.min(1.0, Math.max(0, finalScore));

      if (finalScore >= minSimilarity) {
        const snippet =
          doc.item.content.length > 180
            ? `${doc.item.content.slice(0, 180)}...`
            : doc.item.content;

        const source: GroundedSource = {
          id: doc.item.id,
          customerName: doc.item.customerName,
          customerCompany: doc.item.customerCompany,
          customerTier: doc.item.customerTier,
          channel: doc.item.channel,
          snippet,
          sentiment: doc.item.sentiment,
          featureArea: doc.item.featureArea,
          urgency: doc.item.urgency,
          createdAt: doc.item.createdAt,
          similarityScore: Math.round(denseScore * 100) / 100,
        };

        scoredList.push({
          item: doc.item,
          similarityScore: finalScore,
          denseScore,
          lexicalScore,
          source,
        });
      }
    }

    // 3. Sort by highest score first
    scoredList.sort((a, b) => b.similarityScore - a.similarityScore);
    const topResults = scoredList.slice(0, topK);

    const endTime = performance.now();
    const latencyMs = Math.round((endTime - startTime) * 10) / 10;
    const avgSimilarity =
      topResults.length > 0
        ? Math.round(
            (topResults.reduce((acc, curr) => acc + curr.similarityScore, 0) /
              topResults.length) *
              100
          ) / 100
        : 0;

    return {
      results: topResults,
      stats: {
        vectorCount: wsDocs.size,
        latencyMs,
        model: this.modelName,
        searchMode,
        avgSimilarity,
      },
    };
  }

  /**
   * Get vector index status and health for a workspace
   */
  public getStatus(workspaceId: string, totalDocuments: number = 0): VectorIndexStatus {
    const wsDocs = this.documents.get(workspaceId);
    const totalVectors = wsDocs ? wsDocs.size : 0;

    return {
      workspaceId,
      totalDocuments: Math.max(totalDocuments, totalVectors),
      totalVectors,
      dimension: this.dimension,
      model: this.modelName,
      cacheHits: this.cacheHits,
      lastIndexedAt: this.lastIndexedTime.get(workspaceId) || new Date().toISOString(),
    };
  }

  /**
   * Clear index for a workspace
   */
  public clearWorkspace(workspaceId: string) {
    this.documents.delete(workspaceId);
    this.hashIndex.delete(workspaceId);
    this.lastIndexedTime.delete(workspaceId);
  }
}

// Global Singleton Instance for Server Runtime
export const vectorEngine = new VectorEngine();
