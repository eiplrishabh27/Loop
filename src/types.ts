export type DataType = 'csv' | 'tsv' | 'json' | 'text' | 'markdown';

export type AnalysisFocus =
  | 'comprehensive'
  | 'financial'
  | 'sentiment'
  | 'growth'
  | 'risk_anomaly'
  | 'operational';

export interface ColumnProfile {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  sampleValues: (string | number | boolean | null)[];
  nullCount: number;
  distinctCount: number;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
}

export interface ParsedDataset {
  name: string;
  type: DataType;
  headers: string[];
  rows: Record<string, any>[];
  rawText: string;
  totalRows: number;
  totalColumns: number;
  columnProfiles: ColumnProfile[];
  fileSizeFormatted: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  change?: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export interface InsightItem {
  id: string;
  title: string;
  category: 'trend' | 'anomaly' | 'correlation' | 'opportunity' | 'risk' | 'strength';
  severity: 'high' | 'medium' | 'low' | 'info';
  description: string;
  evidence: string;
  recommendation: string;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  description: string;
  chartType: 'bar' | 'line' | 'area' | 'pie';
  xAxisKey: string;
  seriesKeys?: ChartSeries[];
  data: Record<string, any>[];
}

export interface SegmentItem {
  name: string;
  shareOrSize: string;
  keyCharacteristics: string[];
  strategicNote: string;
}

export interface ActionPlanItem {
  priority: 'P1' | 'P2' | 'P3';
  action: string;
  expectedImpact: string;
  owner: string;
  timeline: string;
}

export interface DataQualityReport {
  score: number;
  rating: string;
  findings: string[];
  recommendations?: string[];
}

export interface AnalysisReport {
  summary: string;
  keyMetrics: KeyMetric[];
  insights: InsightItem[];
  chartConfigs: ChartConfig[];
  segments?: SegmentItem[];
  actionPlan: ActionPlanItem[];
  dataQuality: DataQualityReport;
  suggestedQuestions: string[];
  generatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SampleDataset {
  id: string;
  title: string;
  category: string;
  description: string;
  format: DataType;
  rawContent: string;
  iconName: string;
}
