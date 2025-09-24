// types/bigquery-adser.ts

export interface TeamMetric {
    team: string;
    adser: string;
    dailyData: DailyDataPoint[];
    totalClicks: number;
    totalCPC: number;
    totalDeposits: number;
    totalCostPerDeposit: number;
    monthlyDepositsTarget: number;
    dailyCoverTarget: number;
    averageCPM: number;
    averageQualityScore: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface DailyDataPoint {
    date: string;
    clicks: number;
    cpc: number;
    cpm: number;
    deposits: number;
    costPerDeposit: number;
    qualityScore: number;
    covers: number;
}

export interface ThresholdRule {
    metric: string;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    value: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface AdserConfig {
    cpmThreshold: number;
    costPerDepositThreshold: number;
    monthlyDepositsTarget: number;
    dailyCoverTarget: number;
    customRules: ThresholdRule[];
}

export interface BigQueryAdserData {
    date: string;
    adser_name: string;
    team: string;
    clicks: number;
    impressions: number;
    cost: number;
    conversions: number;
    quality_score: number;
    deposits: number;
    cost_per_deposit: number;
    covers: number;
}

export interface OverviewResponse {
    teamMetrics: TeamMetric[];
    summary: {
        totalClicks: number;
        totalDeposits: number;
        averageCPM: number;
        averageCostPerDeposit: number;
        totalTeams: number;
        activeAdsers: number;
    };
}

export interface ChartDataPoint {
    name: string;
    value: number;
    team: string;
    adser: string;
    status: string;
}