// services/insuranceApi.ts
import { api } from './api';

// Error types for better error handling
export class InsuranceApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'InsuranceApiError';
  }
}

export interface CreateAssetRequest {
  make: string;
  model: string;
  year: number;
  primaryLocation: string;
  mainDriverAge: number;
  description?: string;
}

export interface UpdateAssetRequest {
  make?: string;
  model?: string;
  year?: number;
  primaryLocation?: string;
  mainDriverAge?: number;
  description?: string;
}

export interface InsuranceAsset {
  id: string;
  itemName: string;
  category: string;
  monthlyPayment: number;
  dateAdded: string;
  riskLevel: string;
  status: string;
  make: string;
  model: string;
  year: number;
  policyNumber: string;
  description?: string;
  coverageAmount?: number;
  primaryLocation: string;
  mainDriverAge: number;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
  deductible?: number;
}

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

export interface ProcessAssetResponse {
  asset: InsuranceAsset;
  assessment: {
    riskScore: number;
    riskLevel: string;
    monthlyPayment: number;
    coverageAmount: number;
  };
}

class InsuranceApiService {
  private handleApiError(error: any): never {
    console.error('Insurance API Error:', error);
    
    if (error.message?.includes('Too many requests')) {
      throw new InsuranceApiError('Too many requests. Please try again later.', 429);
    }
    
    if (error.message?.includes('Authentication')) {
      throw new InsuranceApiError('Please log in again to continue.', 401);
    }
    
    if (error.message?.includes('Validation failed')) {
      throw new InsuranceApiError('Please check your input and try again.', 400, error.details);
    }
    
    throw new InsuranceApiError(
      error.message || 'An unexpected error occurred',
      error.statusCode || 500
    );
  }

  /**
   * Create a new insured asset
   */
  async createAsset(assetData: CreateAssetRequest): Promise<InsuranceAsset> {
    try {
      console.log('Creating asset:', assetData);
      const response = await api.post('/api/insurance', assetData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create asset');
      }
      
      return response.data.asset;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get all user's assets
   */
  async getUserAssets(): Promise<InsuranceAsset[]> {
    try {
      const response = await api.get('/api/insurance');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch assets');
      }
      
      return response.data.assets || [];
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get single asset by ID
   */
  async getAsset(assetId: string): Promise<InsuranceAsset> {
    try {
      const response = await api.get(`/api/insurance/${assetId}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch asset');
      }
      
      return response.data.asset;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Update asset information
   */
  async updateAsset(assetId: string, updateData: UpdateAssetRequest): Promise<InsuranceAsset> {
    try {
      console.log('Updating asset:', assetId, updateData);
      const response = await api.put(`/api/insurance/${assetId}`, updateData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update asset');
      }
      
      return response.data.asset;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    try {
      const response = await api.delete(`/api/insurance/${assetId}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete asset');
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Process asset for insurance (risk assessment)
   */
  async processAsset(assetId: string): Promise<ProcessAssetResponse> {
    try {
      console.log('Processing asset for risk assessment:', assetId);
      const response = await api.post(`/api/insurance/${assetId}/process`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to process asset');
      }
      
      return {
        asset: response.data.asset,
        assessment: response.data.assessment
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get insurance summary
   */
  async getInsuranceSummary(): Promise<InsuranceSummary> {
    try {
      const response = await api.get('/api/insurance/summary');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch insurance summary');
      }
      
      return response.data.summary;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get assets by status
   */
  async getAssetsByStatus(status: string): Promise<InsuranceAsset[]> {
    try {
      const response = await api.get(`/api/insurance/status?status=${encodeURIComponent(status)}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch assets by status');
      }
      
      return response.data.assets || [];
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get asset by policy number
   */
  async getAssetByPolicy(policyNumber: string): Promise<InsuranceAsset> {
    try {
      const response = await api.get(`/api/insurance/policy/${encodeURIComponent(policyNumber)}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch asset by policy number');
      }
      
      return response.data.asset;
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

export const insuranceApi = new InsuranceApiService();