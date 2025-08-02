// types/insure.ts
export interface InsuredAsset {
  id: string;
  itemName: string;
  category: string;
  monthlyPayment: number;
  dateAdded: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' | 'pending';
  status: 'Pending' | 'Active' | 'Suspended' | 'Expired' | 'Cancelled' | 'Declined';
  make: string;
  model: string;
  year: number;
  policyNumber: string;
  description?: string;
  coverageAmount?: number;
  deductible?: number;
  
  // Backend specific fields
  primaryLocation: string;
  mainDriverAge: number;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type SortBy = 'itemName' | 'monthlyPayment' | 'dateAdded' | 'riskLevel' | 'status';

export interface InsuranceSummary {
  totalAssets: number;
  activeAssets: number;
  pendingAssets: number;
  totalMonthlyPremium: number;
  riskDistribution: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  monthlyPayment: number;
  coverageAmount: number;
}