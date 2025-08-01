// src/ml/index.js - Main ML Interface for Travel Risk System
const { spawn } = require('child_process');
const path = require('path');

class MLRiskSystem {
    constructor() {
        this.pythonPath = process.platform === 'win32' ? 'python' : 'python3';
        this.modelPath = path.join(__dirname, 'models');
        this.dataPath = path.join(__dirname, 'data');
        
        // Hardcoded demo data for hackathon speed
        this.saRiskData = {
            crimeHotspots: {
                'johannesburg_cbd': 85,
                'soweto': 75,
                'pretoria_central': 60,
                'sandton': 40,
                'centurion': 35,
                'midrand': 45,
                'alexandra': 80,
                'hillbrow': 90
            },
            vehicleTheftRisk: {
                'toyota_hilux': 90,
                'vw_polo': 80,
                'bmw_x5': 85,
                'toyota_corolla': 60,
                'nissan_np200': 70,
                'ford_ranger': 85,
                'mercedes_benz': 75,
                'audi': 70
            }
        };
        
        console.log('🤖 MLRiskSystem initialized');
    }
    
    /**
     * Main function: Get comprehensive risk assessment
     */
    async getRiskAssessment(routeData, weatherData, vehicleType = null, travelTime = null) {
        try {
            console.log('🔍 Starting risk assessment...');
            
            // Step 1: Get Prophet predictions
            const prophetPredictions = await this.getProphetPredictions(routeData, travelTime);
            
            // Step 2: Apply area-specific adjustments
            const adjustedPredictions = this.applyAreaRiskAdjustments(prophetPredictions, routeData);
            
            // Step 3: Add vehicle-specific risk
            const finalPredictions = this.addVehicleRisk(adjustedPredictions, vehicleType);
            
            // Step 4: Calculate composite risk
            const compositeRisk = this.calculateCompositeRisk(finalPredictions);
            
            // Step 5: Generate user-friendly alert
            const riskAlert = this.generateRiskAlert(compositeRisk, routeData);
            
            // Step 6: Try AI analysis (with fallback)
            const aiAnalysis = await this.getAIAnalysis(compositeRisk, routeData);
            
            return {
                success: true,
                predictions: compositeRisk,
                alert: riskAlert,
                aiAnalysis: aiAnalysis,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Risk assessment failed:', error.message);
            return {
                success: false,
                error: error.message,
                fallbackRisk: this.getFallbackRisk(routeData, vehicleType)
            };
        }
    }
    
    /**
     * Get Prophet ML predictions (calls Python script)
     */
    async getProphetPredictions(routeData, travelTime) {
        try {
            const scriptPath = path.join(this.modelPath, 'prophetModels.py');
            const inputData = {
                route: routeData,
                travelTime: travelTime || new Date().toISOString(),
                areas: routeData.areas || []
            };
            
            const result = await this.runPythonScript(scriptPath, inputData);
            console.log('✅ Prophet predictions received');
            return result;
            
        } catch (error) {
            console.log('⚠️ Prophet prediction failed, using fallback');
            // Fallback: Generate reasonable predictions
            return {
                weather_risk: Math.random() * 40 + 20, // 20-60
                crime_base: Math.random() * 30 + 30,   // 30-60
                accident_risk: Math.random() * 20 + 20, // 20-40
                success: false,
                fallback: true
            };
        }
    }
    
    /**
     * Apply South African area-specific risk adjustments
     */
    applyAreaRiskAdjustments(predictions, routeData) {
        const areas = routeData.areas || [routeData.start, routeData.destination];
        let maxCrimeMultiplier = 1.0;
        
        // Find highest crime risk area on route
        areas.forEach(area => {
            const areaKey = area.toLowerCase().replace(/[^a-z]/g, '_');
            if (this.saRiskData.crimeHotspots[areaKey]) {
                const multiplier = this.saRiskData.crimeHotspots[areaKey] / 50;
                maxCrimeMultiplier = Math.max(maxCrimeMultiplier, multiplier);
            }
        });
        
        return {
            ...predictions,
            crime_risk: Math.min(100, predictions.crime_base * maxCrimeMultiplier),
            area_multiplier: maxCrimeMultiplier
        };
    }
    
    /**
     * Add vehicle-specific theft risk
     */
    addVehicleRisk(predictions, vehicleType) {
        let theftRisk = 50; // Default
        
        if (vehicleType) {
            const vehicleKey = vehicleType.toLowerCase().replace(/[^a-z]/g, '_');
            theftRisk = this.saRiskData.vehicleTheftRisk[vehicleKey] || 50;
        }
        
        return {
            ...predictions,
            theft_risk: theftRisk
        };
    }
    
    /**
     * Calculate weighted composite risk score
     */
    calculateCompositeRisk(predictions) {
        const weights = {
            weather_risk: 0.3,
            crime_risk: 0.3,
            accident_risk: 0.2,
            theft_risk: 0.2
        };
        
        const compositeScore = Object.keys(weights).reduce((total, riskType) => {
            return total + (predictions[riskType] || 0) * weights[riskType];
        }, 0);
        
        return {
            ...predictions,
            composite_risk: Math.min(100, Math.max(0, compositeScore))
        };
    }
    
    /**
     * Generate user-friendly risk alert
     */
    generateRiskAlert(predictions, routeData) {
        const risk = predictions.composite_risk;
        
        let alertLevel, alertColor, alertMessage;
        
        if (risk <= 30) {
            alertLevel = 'LOW';
            alertColor = '🟢';
            alertMessage = 'Safe travels! Conditions look favorable for your journey.';
        } else if (risk <= 70) {
            alertLevel = 'MEDIUM';
            alertColor = '🟡';
            alertMessage = 'Moderate risk detected. Consider precautions or alternative routes.';
        } else {
            alertLevel = 'HIGH';
            alertColor = '🔴';
            alertMessage = 'High risk conditions! Strong recommendation to delay or reroute.';
        }
        
        // Identify primary risk factors
        const riskFactors = [];
        if (predictions.weather_risk > 60) riskFactors.push(`Weather: ${predictions.weather_risk.toFixed(0)}%`);
        if (predictions.crime_risk > 60) riskFactors.push(`Crime: ${predictions.crime_risk.toFixed(0)}%`);
        if (predictions.accident_risk > 60) riskFactors.push(`Accidents: ${predictions.accident_risk.toFixed(0)}%`);
        if (predictions.theft_risk > 60) riskFactors.push(`Theft: ${predictions.theft_risk.toFixed(0)}%`);
        
        return {
            level: alertLevel,
            color: alertColor,
            message: alertMessage,
            riskScore: Math.round(risk),
            primaryRisks: riskFactors,
            route: `${routeData.start} → ${routeData.destination}`
        };
    }
    
    /**
     * Get AI analysis (with graceful fallback)
     */
    async getAIAnalysis(predictions, routeData) {
        try {
            // Try to load AI analyzer
            const AIAnalyzer = require('./analyzers/aiAnalyzer');
            const analyzer = new AIAnalyzer();
            return await analyzer.analyzeRisk(predictions, routeData);
        } catch (error) {
            console.log('💡 Using fallback analysis (AI unavailable)');
            return this.getFallbackAnalysis(predictions, routeData);
        }
    }
    
    /**
     * Fallback analysis when AI is unavailable
     */
    getFallbackAnalysis(predictions, routeData) {
        const risks = {
            weather: predictions.weather_risk,
            crime: predictions.crime_risk,
            accident: predictions.accident_risk,
            theft: predictions.theft_risk
        };
        
        const topRisk = Object.keys(risks).reduce((a, b) => risks[a] > risks[b] ? a : b);
        const riskValue = risks[topRisk];
        
        const insights = {
            weather: `Primary concern is severe weather risk (${riskValue.toFixed(0)}%). South African weather can change rapidly with potential for hail and flooding.`,
            crime: `High crime risk detected (${riskValue.toFixed(0)}%). This route includes areas with elevated vehicle crime rates.`,
            accident: `Elevated accident probability (${riskValue.toFixed(0)}%). Road and traffic conditions increase collision likelihood.`,
            theft: `Vehicle theft risk is significant (${riskValue.toFixed(0)}%). Your vehicle may be targeted in this area.`
        };
        
        return {
            analysis: insights[topRisk],
            poweredBy: 'Rule-based Analysis (Fallback)',
            confidence: 'medium'
        };
    }
    
    /**
     * Run Python script and return parsed result
     */
    runPythonScript(scriptPath, inputData) {
        return new Promise((resolve, reject) => {
            const python = spawn(this.pythonPath, [scriptPath]);
            
            let stdout = '';
            let stderr = '';
            
            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            python.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (e) {
                        reject(new Error('Invalid JSON from Python script'));
                    }
                } else {
                    reject(new Error(`Python script failed: ${stderr}`));
                }
            });
            
            // Send input data to Python script
            python.stdin.write(JSON.stringify(inputData));
            python.stdin.end();
        });
    }
    
    /**
     * Emergency fallback when everything fails
     */
    getFallbackRisk(routeData, vehicleType) {
        return {
            level: 'MEDIUM',
            color: '🟡',
            message: 'Risk assessment unavailable. Please exercise standard precautions.',
            riskScore: 50,
            route: `${routeData.start} → ${routeData.destination}`,
            fallback: true
        };
    }
}

module.exports = MLRiskSystem;