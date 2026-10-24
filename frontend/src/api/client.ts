export interface User {
  id: number;
  email: string;
  full_name?: string;
  plan_tier: string;
  is_active: boolean;
  created_at: string;
}

export interface ColumnMeta {
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  distinct_count: number;
  sample_values: any[];
  is_numeric: boolean;
  is_datetime: boolean;
}

export interface ProfilingData {
  total_rows: number;
  total_columns: number;
  duplicate_rows: number;
  total_missing_cells: number;
  missing_cells_pct: number;
  numeric_stats: Array<{
    column: string;
    mean: number;
    std: number;
    min: number;
    q25: number;
    median: number;
    q75: number;
    max: number;
    sum: number;
    outliers_count: number;
  }>;
  categorical_stats: Array<{
    column: string;
    distribution: Array<{
      value: string;
      count: number;
      percentage: number;
    }>;
  }>;
  columns_meta: ColumnMeta[];
}

export interface Dataset {
  id: string;
  name: string;
  original_filename: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  columns_meta?: ColumnMeta[];
  profiling_data?: ProfilingData;
  is_demo: boolean;
  created_at: string;
}

export interface QueryResult {
  success: boolean;
  query: string;
  interpreted_action: string;
  explanation: string;
  visualization_recommendation: string;
  data: any[];
  columns: string[];
  metric_value?: any;
  metric_label?: string;
  execution_time_ms: number;
  warnings: string[];
  session_id?: string;
}

export interface ForecastPoint {
  period: string;
  historical_value: number | null;
  forecast_value: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
}

export interface ForecastResult {
  success: boolean;
  target_column: string;
  time_column: string;
  method: string;
  method_description: string;
  horizon_periods: number;
  points: ForecastPoint[];
  metrics: {
    mae?: number;
    rmse?: number;
    historical_periods?: number;
  };
  warnings: string[];
}

export interface AnomalyRecord {
  index: number;
  data: Record<string, any>;
  anomaly_score: number;
  flag_reason: string;
}

export interface AnomalyResult {
  success: boolean;
  method: string;
  method_description: string;
  total_records: number;
  anomaly_count: number;
  anomaly_percentage: number;
  flagged_records: AnomalyRecord[];
  warnings: string[];
}

export interface ReportItem {
  id: string;
  dataset_id: string;
  dataset_name: string;
  title: string;
  executive_summary: string;
  findings: Array<{
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'metric' | 'insight';
  }>;
  charts_config?: any[];
  status: string;
  created_at: string;
}

export interface DashboardMetrics {
  datasets_analyzed: number;
  rows_processed: number;
  questions_answered: number;
  insights_generated: number;
  plan_tier: string;
  quota: {
    max_datasets: number;
    max_rows: number;
    max_queries: number;
  };
  usage_breakdown: Record<string, number>;
  activity_feed: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
  }>;
}

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('datapilot_token');
  }

  setToken(token: string) {
    localStorage.setItem('datapilot_token', token);
  }

  clearToken() {
    localStorage.removeItem('datapilot_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'An unexpected server error occurred.';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Datasets
  async getDatasets(): Promise<Dataset[]> {
    return this.request<Dataset[]>('/datasets');
  }

  async getDataset(id: string): Promise<Dataset> {
    return this.request<Dataset>(`/datasets/${id}`);
  }

  async uploadDataset(file: File, name?: string): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    return this.request<Dataset>('/datasets/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async loadDemoDataset(): Promise<Dataset> {
    return this.request<Dataset>('/datasets/load-demo', {
      method: 'POST',
    });
  }

  async getDatasetPreview(id: string, page = 1, pageSize = 25): Promise<{
    dataset_id: string;
    columns: string[];
    rows: any[];
    total_rows: number;
    total_columns: number;
  }> {
    return this.request(`/datasets/${id}/preview?page=${page}&page_size=${pageSize}`);
  }

  async deleteDataset(id: string): Promise<void> {
    return this.request(`/datasets/${id}`, { method: 'DELETE' });
  }

  getExportUrl(id: string): string {
    return `${API_BASE}/datasets/${id}/export`;
  }

  // Analyses & NLP queries
  async queryDataset(datasetId: string, query: string): Promise<QueryResult> {
    return this.request<QueryResult>('/analyses/query', {
      method: 'POST',
      body: JSON.stringify({ dataset_id: datasetId, query }),
    });
  }

  async getAnalysisHistory(): Promise<Array<{
    id: string;
    dataset_id: string;
    dataset_name: string;
    query_text: string;
    interpreted_action: string;
    visualization_type: string;
    execution_time_ms: number;
    created_at: string;
  }>> {
    return this.request('/analyses/history');
  }

  async deleteAnalysis(id: string): Promise<void> {
    return this.request(`/analyses/${id}`, { method: 'DELETE' });
  }

  // Forecasts
  async runForecast(params: {
    dataset_id: string;
    target_column: string;
    time_column?: string;
    horizon_periods?: number;
    method?: string;
  }): Promise<ForecastResult> {
    return this.request<ForecastResult>('/forecasts/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Anomalies
  async detectAnomalies(params: {
    dataset_id: string;
    columns: string[];
    method?: string;
    contamination?: number;
  }): Promise<AnomalyResult> {
    return this.request<AnomalyResult>('/anomalies/detect', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Reports
  async getReports(): Promise<ReportItem[]> {
    return this.request<ReportItem[]>('/reports');
  }

  async generateReport(datasetId: string, title?: string): Promise<ReportItem> {
    return this.request<ReportItem>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ dataset_id: datasetId, title: title || '' }),
    });
  }

  async deleteReport(id: string): Promise<void> {
    return this.request(`/reports/${id}`, { method: 'DELETE' });
  }

  // Usage & Telemetry
  async getMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/usage/metrics');
  }
}

export const api = new ApiClient();
