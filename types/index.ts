// Prediction Types
export interface BreakdownItem {
  hour: string;
  predicted_kw: number;
  predicted_temp: number;
  saving_lkr: number;
}

export interface PredictionData {
  total_kw: number;
  total_savings: number;
  breakdown: BreakdownItem[];
}

export interface PredictionRecord {
  _id: string;
  date: string;
  startHour: number;
  endHour: number;
  totalKw: number;
  totalSavings: number;
  breakdown: BreakdownItem[];
  createdAt: string;
  updatedAt: string;
}

// Fuel Types
export interface FuelLogData {
  _id: string;
  date: string;
  litersUsed: number;
  pricePerLiter: number;
  totalCost: number;
  generatorRuntime: number;
  fuelLevelPercent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalPredictions: number;
  totalEnergyGenerated: number;
  totalSavings: number;
  averageDaily: number;
  fuelSaved: number;
  co2Reduced: number;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  kw?: number;
  savings?: number;
}