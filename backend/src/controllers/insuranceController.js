import InsuranceService from '../services/insuranceService.js';
import { validateInput, assetSchemas } from '../utils/validation.js';

class InsuranceController {
  /**
   * Transform database asset to frontend format
   */
  static transformAsset(asset) {
    return {
      id: asset.id,
      itemName: asset.item_name,
      category: asset.category,
      monthlyPayment: asset.monthly_payment,
      dateAdded: asset.date_added || asset.created_at,
      riskLevel: asset.risk_level,
      status: asset.status,
      make: asset.make,
      model: asset.model,
      year: asset.year,
      policyNumber: asset.policy_number,
      description: asset.description,
      coverageAmount: asset.coverage_amount,
      
      // Additional car details for forms
      engineSize: asset.engine_size,
      fuelType: asset.fuel_type,
      transmission: asset.transmission,
      vin: asset.vin,
      primaryLocation: asset.primary_location,
      annualMileage: asset.annual_mileage,
      primaryUse: asset.primary_use,
      hasAlarm: asset.has_alarm,
      hasTracking: asset.has_tracking,
      hasImmobilizer: asset.has_immobilizer,
      garageType: asset.garage_type,
      mainDriverAge: asset.main_driver_age,
      drivingExperienceYears: asset.driving_experience_years,
      riskScore: asset.risk_score,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at
    };
  }

  /**
   * Add new asset (car)
   */
  static async addAsset(req, res) {
    try {
      const userId = req.user.id;

      const validation = validateInput(assetSchemas.addAsset, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Create asset record
      const asset = await InsuranceService.createAsset(userId, validation.data);

      res.status(201).json({
        success: true,
        message: 'Asset added successfully',
        data: {
          asset: this.transformAsset(asset)
        }
      });

    } catch (error) {
      console.error('Add asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add asset',
        message: error.message
      });
    }
  }

  /**
   * Get all user's assets
   */
  static async getUserAssets(req, res) {
    try {
      const userId = req.user.id;
      const assets = await InsuranceService.getUserAssets(userId);

      // Transform assets for frontend
      const transformedAssets = assets.map(asset => this.transformAsset(asset));

      res.json({
        success: true,
        data: {
          assets: transformedAssets,
          count: transformedAssets.length
        }
      });

    } catch (error) {
      console.error('Get user assets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assets',
        message: error.message
      });
    }
  }

  /**
   * Get single asset by ID
   */
  static async getAsset(req, res) {
    try {
      const userId = req.user.id;
      const assetId = req.params.id;

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required'
        });
      }

      const asset = await InsuranceService.getAssetById(assetId, userId);

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      res.json({
        success: true,
        data: { 
          asset: this.transformAsset(asset) 
        }
      });

    } catch (error) {
      console.error('Get asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch asset',
        message: error.message
      });
    }
  }

  /**
   * Update asset information
   */
  static async updateAsset(req, res) {
    try {
      const userId = req.user.id;
      const assetId = req.params.id;

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required'
        });
      }

      const validation = validateInput(assetSchemas.updateAsset, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Check if asset exists and belongs to user
      const existingAsset = await InsuranceService.getAssetById(assetId, userId);
      if (!existingAsset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      // Update asset
      const updatedAsset = await InsuranceService.updateAsset(assetId, userId, validation.data);

      res.json({
        success: true,
        message: 'Asset updated successfully',
        data: { 
          asset: this.transformAsset(updatedAsset) 
        }
      });

    } catch (error) {
      console.error('Update asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update asset',
        message: error.message
      });
    }
  }

  /**
   * Delete asset
   */
  static async deleteAsset(req, res) {
    try {
      const userId = req.user.id;
      const assetId = req.params.id;

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required'
        });
      }

      // Check if asset exists and belongs to user
      const existingAsset = await InsuranceService.getAssetById(assetId, userId);
      if (!existingAsset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      await InsuranceService.deleteAsset(assetId, userId);

      res.json({
        success: true,
        message: 'Asset deleted successfully'
      });

    } catch (error) {
      console.error('Delete asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete asset',
        message: error.message
      });
    }
  }

  /**
   * Process asset for insurance (perform risk assessment)
   */
  static async processAsset(req, res) {
    try {
      const userId = req.user.id;
      const assetId = req.params.id;

      if (!assetId) {
        return res.status(400).json({
          success: false,
          error: 'Asset ID is required'
        });
      }

      const result = await InsuranceService.processAsset(assetId, userId);

      res.json({
        success: true,
        message: 'Asset processed successfully',
        data: {
          asset: this.transformAsset(result.asset),
          assessment: result.assessment
        }
      });

    } catch (error) {
      console.error('Process asset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process asset',
        message: error.message
      });
    }
  }

  /**
   * Get insurance summary for user
   */
  static async getInsuranceSummary(req, res) {
    try {
      const userId = req.user.id;
      const summary = await InsuranceService.getInsuranceSummary(userId);

      res.json({
        success: true,
        data: { summary }
      });

    } catch (error) {
      console.error('Get insurance summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch insurance summary',
        message: error.message
      });
    }
  }

  /**
   * Get assets by status
   */
  static async getAssetsByStatus(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status parameter is required'
        });
      }

      const validStatuses = ['Pending', 'Active', 'Suspended', 'Expired', 'Cancelled', 'Declined'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const assets = await InsuranceService.getAssetsByStatus(userId, status);

      // Transform assets for frontend
      const transformedAssets = assets.map(asset => this.transformAsset(asset));

      res.json({
        success: true,
        data: {
          assets: transformedAssets,
          count: transformedAssets.length,
          status
        }
      });

    } catch (error) {
      console.error('Get assets by status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch assets by status',
        message: error.message
      });
    }
  }

  /**
   * Get asset by policy number
   */
  static async getAssetByPolicy(req, res) {
    try {
      const userId = req.user.id;
      const { policyNumber } = req.params;

      if (!policyNumber) {
        return res.status(400).json({
          success: false,
          error: 'Policy number is required'
        });
      }

      const asset = await InsuranceService.getAssetByPolicyNumber(policyNumber, userId);

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found with this policy number'
        });
      }

      res.json({
        success: true,
        data: { 
          asset: this.transformAsset(asset) 
        }
      });

    } catch (error) {
      console.error('Get asset by policy error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch asset by policy number',
        message: error.message
      });
    }
  }
}

export default InsuranceController;