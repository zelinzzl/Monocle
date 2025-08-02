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
   * Enhanced risk assessment with realistic South African factors
   */
  static async performRiskAssessment(assetData) {
    // Simulate processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    let riskScore = 15; // Base risk score
    let baseMonthlyPremium = 850; // Base premium in ZAR
    let baseCoverageAmount = 350000; // Base coverage in ZAR

    const make = (assetData.make || '').toLowerCase();
    const model = (assetData.model || '').toLowerCase();
    const age = assetData.main_driver_age || assetData.mainDriverAge;
    const location = (assetData.primary_location || assetData.primaryLocation || '').toLowerCase();

    // === DRIVER AGE FACTOR ===
    if (age < 21) {
      riskScore += 25; // Very high risk
      baseMonthlyPremium *= 1.4;
    } else if (age < 25) {
      riskScore += 18; // High risk
      baseMonthlyPremium *= 1.25;
    } else if (age < 30) {
      riskScore += 8; // Moderate risk
      baseMonthlyPremium *= 1.1;
    } else if (age >= 30 && age <= 55) {
      riskScore -= 5; // Sweet spot - lowest risk
      baseMonthlyPremium *= 0.95;
    } else if (age > 65) {
      riskScore += 12; // Higher risk for elderly
      baseMonthlyPremium *= 1.15;
    }

    // === VEHICLE AGE FACTOR ===
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - assetData.year;
    
    if (carAge === 0) {
      riskScore -= 8; // Brand new car discount
      baseCoverageAmount *= 1.2;
      baseMonthlyPremium *= 1.1; // But higher premium due to replacement cost
    } else if (carAge <= 3) {
      riskScore -= 3; // Nearly new car
      baseCoverageAmount *= 1.1;
    } else if (carAge <= 7) {
      riskScore += 2; // Standard risk
    } else if (carAge <= 12) {
      riskScore += 8; // Aging vehicle
      baseCoverageAmount *= 0.85;
    } else if (carAge <= 20) {
      riskScore += 15; // Old vehicle
      baseCoverageAmount *= 0.7;
    } else {
      riskScore += 25; // Very old vehicle
      baseCoverageAmount *= 0.5;
    }

    // === VEHICLE MAKE & MODEL FACTOR ===
    // Luxury/High-end brands (higher theft risk, expensive parts)
    if (['bmw', 'mercedes', 'audi', 'lexus', 'jaguar', 'porsche', 'maserati', 'bentley'].includes(make)) {
      riskScore += 12;
      baseMonthlyPremium *= 1.3;
      baseCoverageAmount *= 1.5;
    }
    // Premium brands
    else if (['volvo', 'land rover', 'range rover', 'infiniti', 'acura'].includes(make)) {
      riskScore += 8;
      baseMonthlyPremium *= 1.2;
      baseCoverageAmount *= 1.3;
    }
    // Popular theft targets in SA
    else if (['toyota', 'volkswagen', 'ford', 'nissan'].includes(make)) {
      riskScore += 5;
      baseMonthlyPremium *= 1.05;
    }
    // Reliable/safe brands (lower risk)
    else if (['hyundai', 'kia', 'mazda', 'subaru', 'honda'].includes(make)) {
      riskScore -= 2;
      baseMonthlyPremium *= 0.98;
    }
    // Budget/economy brands
    else if (['datsun', 'tata', 'chery', 'geely', 'proton'].includes(make)) {
      riskScore -= 5;
      baseMonthlyPremium *= 0.92;
      baseCoverageAmount *= 0.8;
    }

    // Specific high-risk models in SA
    const highRiskModels = ['hilux', 'ranger', 'polo', 'golf', 'fortuner', 'quantum', 'avanza'];
    if (highRiskModels.some(riskModel => model.includes(riskModel))) {
      riskScore += 8;
      baseMonthlyPremium *= 1.15;
    }

    // === LOCATION RISK (South African Cities) ===
    const locationRisk = this.getLocationRisk(location);
    riskScore += locationRisk.riskPoints;
    baseMonthlyPremium *= locationRisk.premiumMultiplier;

    // === COVERAGE AMOUNT ADJUSTMENTS ===
    // Adjust coverage based on vehicle value estimation
    if (carAge <= 3 && ['bmw', 'mercedes', 'audi', 'lexus'].includes(make)) {
      baseCoverageAmount = Math.max(baseCoverageAmount, 600000);
    } else if (carAge <= 5 && ['toyota', 'volkswagen'].includes(make)) {
      baseCoverageAmount = Math.max(baseCoverageAmount, 400000);
    }

    // === FINAL CALCULATIONS ===
    // Ensure risk score is within bounds
    riskScore = Math.max(5, Math.min(95, riskScore));

    // Determine risk level with SA-specific thresholds
    let riskLevel;
    if (riskScore <= 20) riskLevel = 'Low';
    else if (riskScore <= 40) riskLevel = 'Medium';
    else if (riskScore <= 70) riskLevel = 'High';
    else riskLevel = 'Critical';

    // Calculate final premium based on risk
    const riskMultiplier = 1 + (riskScore / 100);
    const monthlyPayment = Math.round(baseMonthlyPremium * riskMultiplier);

    // Calculate final coverage amount (round to nearest 10k)
    const coverageAmount = Math.round(baseCoverageAmount / 10000) * 10000;

    return {
      riskScore: parseFloat(riskScore.toFixed(1)),
      riskLevel,
      monthlyPayment,
      coverageAmount,
      factors: {
        driverAge: age,
        vehicleAge: carAge,
        location: locationRisk.name,
        makeRisk: this.getMakeRiskCategory(make),
        modelRisk: highRiskModels.some(riskModel => model.includes(riskModel)) ? 'High-risk model' : 'Standard model'
      }
    };
  }

  /**
   * Get location risk data for South African cities and regions
   */
  static getLocationRisk(location) {
    const locationLower = location.toLowerCase();

    // Major metropolitan areas - highest risk
    if (locationLower.includes('johannesburg') || locationLower.includes('joburg') || 
        locationLower.includes('jhb') || locationLower.includes('sandton') || 
        locationLower.includes('rosebank') || locationLower.includes('soweto') ||
        locationLower.includes('alexandra') || locationLower.includes('randburg')) {
      return { name: 'Johannesburg Metro', riskPoints: 20, premiumMultiplier: 1.35 };
    }

    if (locationLower.includes('cape town') || locationLower.includes('capetown') ||
        locationLower.includes('bellville') || locationLower.includes('mitchells plain') ||
        locationLower.includes('khayelitsha') || locationLower.includes('athlone')) {
      return { name: 'Cape Town Metro', riskPoints: 18, premiumMultiplier: 1.30 };
    }

    if (locationLower.includes('durban') || locationLower.includes('pinetown') ||
        locationLower.includes('chatsworth') || locationLower.includes('phoenix') ||
        locationLower.includes('umlazi') || locationLower.includes('pietermaritzburg')) {
      return { name: 'Durban Metro', riskPoints: 16, premiumMultiplier: 1.25 };
    }

    // Secondary cities - high risk
    if (locationLower.includes('pretoria') || locationLower.includes('tshwane') ||
        locationLower.includes('centurion') || locationLower.includes('hatfield')) {
      return { name: 'Pretoria/Tshwane', riskPoints: 15, premiumMultiplier: 1.22 };
    }

    if (locationLower.includes('port elizabeth') || locationLower.includes('gqeberha') ||
        locationLower.includes('uitenhage')) {
      return { name: 'Port Elizabeth/Gqeberha', riskPoints: 14, premiumMultiplier: 1.20 };
    }

    if (locationLower.includes('bloemfontein') || locationLower.includes('mangaung')) {
      return { name: 'Bloemfontein', riskPoints: 12, premiumMultiplier: 1.15 };
    }

    // Coastal cities - moderate risk
    if (locationLower.includes('east london') || locationLower.includes('buffalo city')) {
      return { name: 'East London', riskPoints: 11, premiumMultiplier: 1.12 };
    }

    if (locationLower.includes('george') || locationLower.includes('knysna') ||
        locationLower.includes('mossel bay') || locationLower.includes('plettenberg')) {
      return { name: 'Garden Route', riskPoints: 8, premiumMultiplier: 1.05 };
    }

    // Mining towns - moderate to high risk
    if (locationLower.includes('rustenburg') || locationLower.includes('klerksdorp') ||
        locationLower.includes('potchefstroom') || locationLower.includes('welkom')) {
      return { name: 'Mining Region', riskPoints: 13, premiumMultiplier: 1.18 };
    }

    // Industrial cities
    if (locationLower.includes('germiston') || locationLower.includes('benoni') ||
        locationLower.includes('springs') || locationLower.includes('boksburg')) {
      return { name: 'East Rand', riskPoints: 16, premiumMultiplier: 1.24 };
    }

    if (locationLower.includes('vereeniging') || locationLower.includes('vanderbijlpark') ||
        locationLower.includes('sasolburg')) {
      return { name: 'Vaal Triangle', riskPoints: 14, premiumMultiplier: 1.19 };
    }

    // Smaller cities - lower risk
    if (locationLower.includes('stellenbosch') || locationLower.includes('paarl') ||
        locationLower.includes('worcester') || locationLower.includes('hermanus')) {
      return { name: 'Western Cape Towns', riskPoints: 7, premiumMultiplier: 1.03 };
    }

    if (locationLower.includes('nelspruit') || locationLower.includes('mbombela') ||
        locationLower.includes('white river')) {
      return { name: 'Mpumalanga Region', riskPoints: 9, premiumMultiplier: 1.08 };
    }

    if (locationLower.includes('polokwane') || locationLower.includes('tzaneen') ||
        locationLower.includes('thohoyandou')) {
      return { name: 'Limpopo Region', riskPoints: 8, premiumMultiplier: 1.06 };
    }

    // Rural/other areas - lowest risk
    if (locationLower.includes('rural') || locationLower.includes('farm') ||
        locationLower.includes('village') || locationLower.includes('small town')) {
      return { name: 'Rural Area', riskPoints: 5, premiumMultiplier: 0.95 };
    }

    // Default for unknown locations
    return { name: 'Other Urban Area', riskPoints: 10, premiumMultiplier: 1.10 };
  }

  /**
   * Get make risk category for reporting
   */
  static getMakeRiskCategory(make) {
    if (['bmw', 'mercedes', 'audi', 'lexus', 'jaguar', 'porsche'].includes(make)) {
      return 'Luxury (High Risk)';
    } else if (['toyota', 'volkswagen', 'ford', 'nissan'].includes(make)) {
      return 'Popular (Moderate Risk)';
    } else if (['hyundai', 'kia', 'mazda', 'honda'].includes(make)) {
      return 'Reliable (Low Risk)';
    } else {
      return 'Standard Risk';
    }
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