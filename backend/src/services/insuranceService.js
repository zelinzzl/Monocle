import { supabase } from "../config/database.js";

class InsuranceService {
  /**
   * Generate policy number in format INS-YYYY-XXXXXX
   */
  static async generatePolicyNumber() {
    const year = new Date().getFullYear();
    
    try {
      // Get next sequence number
      const { data, error } = await supabase.rpc('nextval', {
        sequence_name: 'policy_number_seq'
      });
      
      if (error) {
        // Fallback to timestamp-based generation if sequence fails
        const timestamp = Date.now().toString().slice(-6);
        return `INS-${year}-${timestamp}`;
      }
      
      const sequenceNumber = data.toString().padStart(6, '0');
      return `INS-${year}-${sequenceNumber}`;
    } catch (error) {
      // Fallback for any errors
      const timestamp = Date.now().toString().slice(-6);
      return `INS-${year}-${timestamp}`;
    }
  }

  /**
   * Create new insured asset (simplified)
   */
  static async createAsset(userId, assetData) {
    const {
      make, model, year, primaryLocation, mainDriverAge, description
    } = assetData;

    // Generate policy number
    const policyNumber = await this.generatePolicyNumber();
    
    // Create item name: "YYYY Make Model"
    const itemName = `${year} ${make} ${model}`;

    // Insert asset record with only core fields
    const { data: asset, error: assetError } = await supabase
      .from("insured_assets")
      .insert([
        {
          user_id: userId,
          item_name: itemName,
          category: 'Vehicle',
          policy_number: policyNumber,
          make: make.trim(),
          model: model.trim(),
          year: parseInt(year),
          primary_location: primaryLocation.trim(),
          main_driver_age: parseInt(mainDriverAge),
          description: description?.trim() || null,
          status: 'Pending'
        },
      ])
      .select("*")
      .single();

    if (assetError) {
      console.error('Asset creation error:', assetError);
      throw new Error("Failed to create insured asset");
    }

    return asset;
  }

  /**
   * Get all assets for a user
   */
  static async getUserAssets(userId) {
    const { data: assets, error } = await supabase
      .from("insured_assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Get user assets error:', error);
      throw new Error("Failed to fetch user assets");
    }

    return assets || [];
  }

  /**
   * Get asset by ID (with user ownership check)
   */
  static async getAssetById(assetId, userId) {
    const { data: asset, error } = await supabase
      .from("insured_assets")
      .select("*")
      .eq("id", assetId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error('Get asset by ID error:', error);
      throw new Error("Failed to fetch asset");
    }

    return asset;
  }

  /**
   * Update asset information (simplified)
   */
  static async updateAsset(assetId, userId, updateData) {
    const allowedFields = ['make', 'model', 'year', 'primaryLocation', 'mainDriverAge', 'description'];
    const updateObject = { updated_at: new Date().toISOString() };

    let shouldUpdateItemName = false;
    let newMake, newModel, newYear;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        let value = updateData[key];

        // Handle field mapping and type conversion
        if (key === 'primaryLocation') {
          updateObject.primary_location = value.trim();
        } else if (key === 'mainDriverAge') {
          updateObject.main_driver_age = parseInt(value);
        } else if (key === 'year') {
          value = parseInt(value);
          updateObject[key] = value;
          newYear = value;
          shouldUpdateItemName = true;
        } else if (key === 'make') {
          value = value.trim();
          updateObject[key] = value;
          newMake = value;
          shouldUpdateItemName = true;
        } else if (key === 'model') {
          value = value.trim();
          updateObject[key] = value;
          newModel = value;
          shouldUpdateItemName = true;
        } else if (typeof value === 'string') {
          updateObject[key] = value.trim();
        } else {
          updateObject[key] = value;
        }
      }
    });

    // Update item_name if make, model, or year changed
    if (shouldUpdateItemName) {
      const currentAsset = await this.getAssetById(assetId, userId);
      if (!currentAsset) {
        throw new Error("Asset not found");
      }

      const finalMake = newMake || currentAsset.make;
      const finalModel = newModel || currentAsset.model;
      const finalYear = newYear || currentAsset.year;
      
      updateObject.item_name = `${finalYear} ${finalMake} ${finalModel}`;
    }

    const { data: updatedAsset, error } = await supabase
      .from("insured_assets")
      .update(updateObject)
      .eq("id", assetId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      console.error('Update asset error:', error);
      throw new Error("Failed to update asset");
    }

    return updatedAsset;
  }

  /**
   * Delete asset
   */
  static async deleteAsset(assetId, userId) {
    const { error } = await supabase
      .from("insured_assets")
      .delete()
      .eq("id", assetId)
      .eq("user_id", userId);

    if (error) {
      console.error('Delete asset error:', error);
      throw new Error("Failed to delete asset");
    }

    return true;
  }

  /**
   * Simplified risk assessment (basic algorithm)
   */
  static async performRiskAssessment(assetData) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    let riskScore = 30; // Base risk score
    let baseMonthlyPremium = 800; // Base premium in ZAR
    let baseCoverageAmount = 300000; // Base coverage in ZAR

    // Age factor (younger drivers = higher risk)
    const age = assetData.main_driver_age || assetData.mainDriverAge;
    if (age < 25) riskScore += 20;
    else if (age < 35) riskScore += 10;
    else if (age < 50) riskScore += 0;
    else riskScore += 5; // Older drivers have slightly higher risk

    // Car age factor
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - assetData.year;
    if (carAge > 10) {
      riskScore += 15;
      baseCoverageAmount *= 0.7; // Older cars get lower coverage
    } else if (carAge > 5) {
      riskScore += 8;
      baseCoverageAmount *= 0.85;
    } else {
      riskScore -= 5; // New cars get discount
      baseCoverageAmount *= 1.1;
    }

    // Location risk (South African cities)
    const location = (assetData.primary_location || assetData.primaryLocation || '').toLowerCase();
    if (location.includes('johannesburg') || location.includes('joburg') || location.includes('jhb')) {
      riskScore += 15; // Highest risk city
    } else if (location.includes('cape town') || location.includes('capetown')) {
      riskScore += 12;
    } else if (location.includes('durban') || location.includes('pretoria')) {
      riskScore += 10;
    } else {
      riskScore += 5; // Other areas
    }

    // Ensure risk score is within bounds
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    let riskLevel;
    if (riskScore < 25) riskLevel = 'Low';
    else if (riskScore < 50) riskLevel = 'Medium';
    else if (riskScore < 75) riskLevel = 'High';
    else riskLevel = 'Critical';

    // Calculate premium based on risk
    const riskMultiplier = 1 + (riskScore / 100);
    const monthlyPayment = Math.round(baseMonthlyPremium * riskMultiplier);

    // Calculate coverage amount (round to nearest 10k)
    const coverageAmount = Math.round(baseCoverageAmount / 10000) * 10000;

    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      riskLevel,
      monthlyPayment,
      coverageAmount
    };
  }

  /**
   * Process asset for insurance (perform risk assessment and update record)
   */
  static async processAsset(assetId, userId) {
    // Get asset data
    const asset = await this.getAssetById(assetId, userId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    if (asset.status !== 'Pending') {
      throw new Error("Asset has already been processed");
    }

    // Perform risk assessment
    const assessmentResult = await this.performRiskAssessment(asset);

    // Update asset with assessment results
    const { data: updatedAsset, error } = await supabase
      .from("insured_assets")
      .update({
        risk_score: assessmentResult.riskScore,
        risk_level: assessmentResult.riskLevel,
        monthly_payment: assessmentResult.monthlyPayment,
        coverage_amount: assessmentResult.coverageAmount,
        status: 'Active',
        updated_at: new Date().toISOString()
      })
      .eq("id", assetId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      console.error('Process asset error:', error);
      throw new Error("Failed to process asset");
    }

    return {
      asset: updatedAsset,
      assessment: assessmentResult
    };
  }

  /**
   * Get assets by status
   */
  static async getAssetsByStatus(userId, status) {
    const { data: assets, error } = await supabase
      .from("insured_assets")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Get assets by status error:', error);
      throw new Error("Failed to fetch assets by status");
    }

    return assets || [];
  }

  /**
   * Get user's insurance summary
   */
  static async getInsuranceSummary(userId) {
    const { data: assets, error } = await supabase
      .from("insured_assets")
      .select("status, monthly_payment, risk_level, category")
      .eq("user_id", userId);

    if (error) {
      console.error('Get insurance summary error:', error);
      throw new Error("Failed to fetch insurance summary");
    }

    const summary = {
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status === 'Active').length,
      pendingAssets: assets.filter(a => a.status === 'Pending').length,
      totalMonthlyPremium: assets
        .filter(a => a.status === 'Active' && a.monthly_payment)
        .reduce((sum, a) => sum + parseFloat(a.monthly_payment), 0),
      riskDistribution: {
        Low: assets.filter(a => a.risk_level === 'Low').length,
        Medium: assets.filter(a => a.risk_level === 'Medium').length,
        High: assets.filter(a => a.risk_level === 'High').length,
        Critical: assets.filter(a => a.risk_level === 'Critical').length
      }
    };

    return summary;
  }

  /**
   * Get asset by policy number
   */
  static async getAssetByPolicyNumber(policyNumber, userId) {
    const { data: asset, error } = await supabase
      .from("insured_assets")
      .select("*")
      .eq("policy_number", policyNumber)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error('Get asset by policy number error:', error);
      throw new Error("Failed to fetch asset by policy number");
    }

    return asset;
  }
}

export default InsuranceService;