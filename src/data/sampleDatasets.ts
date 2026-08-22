import { SampleDataset } from '../types';

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'saas-metrics',
    title: 'Global SaaS Subscriptions & Churn',
    category: 'Finance & Subscriptions',
    description: '45 enterprise accounts across tiers, MRR, usage volume, satisfaction score, and churn risk.',
    format: 'csv',
    iconName: 'TrendingUp',
    rawContent: `Customer_ID,Company_Name,Plan_Tier,Monthly_Recurring_Revenue,Contract_Type,Usage_Frequency_Days,NPS_Score,Support_Tickets_30d,Churn_Status,Industry
CUST-101,Nexus Corp,Enterprise,4500,Annual,28,9,1,Active,Fintech
CUST-102,Apex Media,Pro,1200,Monthly,14,6,4,At Risk,Media
CUST-103,Vortex Dynamics,Enterprise,5200,Annual,30,10,0,Active,Manufacturing
CUST-104,CloudScale AI,Enterprise,6800,Annual,29,8,2,Active,Technology
CUST-105,BlueSky Logistics,Starter,499,Monthly,8,4,7,Churned,Logistics
CUST-106,Hyperion Retail,Pro,1450,Annual,22,7,1,Active,Retail
CUST-107,Zenith Health,Enterprise,4800,Annual,27,9,2,Active,Healthcare
CUST-108,Nova Fintech,Pro,1200,Monthly,12,5,5,At Risk,Fintech
CUST-109,Solaris Energy,Starter,399,Monthly,6,3,8,Churned,Energy
CUST-110,Quantum Analytics,Enterprise,7500,Annual,30,10,1,Active,Analytics
CUST-111,Cobalt Labs,Pro,1350,Annual,24,8,2,Active,Biotech
CUST-112,Astra Security,Starter,499,Monthly,10,5,6,Churned,Security
CUST-113,Peak Commerce,Enterprise,5100,Annual,26,9,3,Active,E-Commerce
CUST-114,Terra Agriculture,Starter,399,Annual,15,7,2,Active,Agriculture
CUST-115,Pulse Marketing,Pro,1600,Monthly,16,6,4,At Risk,Marketing
CUST-116,Beacon Systems,Enterprise,4300,Annual,29,8,1,Active,Technology
CUST-117,Velocity Delivery,Pro,1250,Monthly,11,4,6,Churned,Logistics
CUST-118,Echo Media,Starter,499,Monthly,9,5,4,At Risk,Media
CUST-119,Titan Construction,Enterprise,3900,Annual,21,8,2,Active,Real Estate
CUST-120,Lumina Education,Pro,1100,Annual,25,9,0,Active,Education`,
  },
  {
    id: 'customer-feedback',
    title: 'Customer Experience & Escalation Tickets',
    category: 'Customer Support & Sentiment',
    description: 'Support tickets with customer emotion, turnaround time, product module, and root cause notes.',
    format: 'csv',
    iconName: 'MessageSquareText',
    rawContent: `Ticket_ID,Date,Product_Module,Customer_Tier,Urgency,Resolution_Time_Hours,Satisfaction_Score,Feedback_Transcript
TCK-8821,2026-08-01,Billing Engine,Enterprise,Critical,4.2,2,"Invoices generated with duplicate tax line items. Need this fixed immediately before month-end audit."
TCK-8822,2026-08-02,Single Sign-On,Pro,High,8.5,3,"Okta integration intermittently dropping tokens for APAC team members. Causing morning login delays."
TCK-8823,2026-08-03,Data Export,Starter,Medium,1.5,5,"CSV export downloaded super fast! Very satisfied with the new column filter feature."
TCK-8824,2026-08-04,API Webhooks,Enterprise,Critical,2.1,4,"Webhook payloads failed to deliver during peak spike at 2 PM. Retried automatically but alerted our DevOps."
TCK-8825,2026-08-05,User Permissions,Pro,Low,24.0,2,"Takes too many clicks to grant read-only access to guest reviewers. UI feels clunky and unintuitive."
TCK-8826,2026-08-06,Billing Engine,Starter,Medium,12.0,1,"Charged twice for annual renewal without receipt email. Very disappointed with automatic renewal process."
TCK-8827,2026-08-07,Analytics Dashboard,Enterprise,High,5.3,4,"Dashboard takes 15 seconds to load when querying historical 12-month data. Need query caching."
TCK-8828,2026-08-08,Mobile App,Starter,Low,48.0,2,"Push notifications don't navigate to the corresponding alert inside iOS app. Just opens blank home view."
TCK-8829,2026-08-09,Data Export,Pro,Low,0.8,5,"Prompt response from support agent Sarah. Helped format custom delimiter export in 5 minutes."
TCK-8830,2026-08-10,API Webhooks,Enterprise,Critical,1.1,5,"Exceptional troubleshooting by engineer. Fixed payload signature mismatch in real-time on screen share."`,
  },
  {
    id: 'ecommerce-sales',
    title: 'E-Commerce Product Sales & Return Margins',
    category: 'Sales & Inventory',
    description: 'Quarterly sales volume, returns, ad spend, revenue, and gross profit margins across 12 product categories.',
    format: 'csv',
    iconName: 'ShoppingBag',
    rawContent: `SKU,Product_Title,Category,Units_Sold,Unit_Price,Gross_Revenue,Return_Rate_Pct,Ad_Spend_USD,Profit_Margin_Pct
SKU-901,Ergonomic Mesh Chair V2,Office Furniture,1420,289.00,410380,4.2,42000,38.5
SKU-902,Wireless Noise Cancelling Pods,Electronics,3850,149.00,573650,8.6,85000,44.2
SKU-903,Organic Bamboo Bed Sheets,Home & Bedding,2100,89.00,186900,3.1,18500,52.0
SKU-904,Smart Home Air Purifier Pro,Appliances,950,220.00,209000,6.5,31000,31.8
SKU-905,Stainless Steel Thermal Flask,Outdoors,4600,34.00,156400,1.8,12000,61.4
SKU-906,4K Ultra-Wide Monitor 34-inch,Electronics,680,650.00,442000,11.2,58000,24.6
SKU-907,Adjustable Standing Desk Birch,Office Furniture,820,480.00,393600,5.8,49000,34.1
SKU-908,Cold Brew Nitrogen Infuser,Kitchen,1890,65.00,122850,2.4,14200,55.7
SKU-909,Smart Robotic Vacuum Cleaner,Appliances,1120,380.00,425600,9.4,62000,28.3
SKU-910,Lightweight Trail Running Shoes,Apparel,2400,115.00,276000,14.8,44000,41.0
SKU-911,Ceramic Pour-Over Coffee Set,Kitchen,3100,42.00,130200,1.5,9500,64.2
SKU-912,Memory Foam Contour Pillow,Home & Bedding,2800,58.00,162400,3.9,16000,49.5`,
  },
  {
    id: 'startup-runway',
    title: 'Startup Unit Economics & Cloud Infrastructure Spend',
    category: 'Financial Planning & Burn',
    description: 'Monthly cloud infrastructure, headcount, burn rate, new logo acquisition, CAC, and LTV trends.',
    format: 'json',
    iconName: 'DollarSign',
    rawContent: JSON.stringify(
      [
        { "month": "Jan 2026", "arr_inflow": 125000, "cloud_infra_cost": 24000, "headcount_cost": 88000, "marketing_spend": 35000, "net_burn": -22000, "new_customers": 18, "cac": 1944, "avg_ltv": 14200 },
        { "month": "Feb 2026", "arr_inflow": 142000, "cloud_infra_cost": 26500, "headcount_cost": 92000, "marketing_spend": 38000, "net_burn": -14500, "new_customers": 22, "cac": 1727, "avg_ltv": 15100 },
        { "month": "Mar 2026", "arr_inflow": 168000, "cloud_infra_cost": 31000, "headcount_cost": 96000, "marketing_spend": 42000, "net_burn": -1000, "new_customers": 29, "cac": 1448, "avg_ltv": 16400 },
        { "month": "Apr 2026", "arr_inflow": 195000, "cloud_infra_cost": 34500, "headcount_cost": 104000, "marketing_spend": 46000, "net_burn": 10500, "new_customers": 36, "cac": 1277, "avg_ltv": 17200 },
        { "month": "May 2026", "arr_inflow": 230000, "cloud_infra_cost": 38000, "headcount_cost": 112000, "marketing_spend": 51000, "net_burn": 29000, "new_customers": 44, "cac": 1159, "avg_ltv": 18500 },
        { "month": "Jun 2026", "arr_inflow": 272000, "cloud_infra_cost": 43500, "headcount_cost": 120000, "marketing_spend": 58000, "net_burn": 50500, "new_customers": 53, "cac": 1094, "avg_ltv": 19400 }
      ],
      null,
      2
    ),
  },
];
