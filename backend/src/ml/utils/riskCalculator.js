// src/controllers/riskController.js - API Controller for Risk Assessment
import MLRiskSystem from '../ml/index.js';

class RiskController {
    constructor() {
        this.mlSystem = new MLRiskSystem();
    }

    /**
     * Main API endpoint: POST /api/risk/assess
     * Expected body: { startLocation, endLocation, vehicleType?, travelTime? }
     */
    async assessRisk(req, res) {
        try {
            const { 
                startLocation, 
                endLocation, 
                vehicleType = null, 
                travelTime = null,
                routeData = null,
                weatherData = null 
            } = req.body;

            // Validate required fields
            if (!startLocation || !endLocation) {
                return res.status(400).json({
                    success: false,
                    error: 'startLocation and endLocation are required'
                });
            }

            console.log(`🔍 Risk assessment request: ${startLocation} → ${endLocation}`);

            // Build route data (if not provided by GPS team)
            const route = routeData || {
                start: startLocation,
                destination: endLocation,
                areas: [startLocation, endLocation],
                distance: 25, // Default values for demo
                estimatedTime: '30 minutes'
            };

            // Use weather data (if not provided by Weather team)
            const weather = weatherData || {
                severity: 'moderate',
                conditions: 'partly_cloudy'
            };

            // Get ML risk assessment
            const riskAssessment = await this.mlSystem.getRiskAssessment(
                route,
                weather,
                vehicleType,
                travelTime
            );

            // Add request metadata
            const response = {
                ...riskAssessment,
                request: {
                    route: `${startLocation} → ${endLocation}`,
                    vehicle: vehicleType || 'Unknown',
                    requestTime: new Date().toISOString()
                }
            };

            res.json(response);

        } catch (error) {
            console.error('❌ Risk assessment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during risk assessment',
                details: error.message
            });
        }
    }

    /**
     * Quick risk check: GET /api/risk/quick/:start/:end
     * For simple demos and testing
     */
    async quickRiskCheck(req, res) {
        try {
            const { start, end } = req.params;
            const { vehicle } = req.query;

            console.log(`⚡ Quick risk check: ${start} → ${end}`);

            const routeData = {
                start: start.replace(/_/g, ' '),
                destination: end.replace(/_/g, ' '),
                areas: [start.replace(/_/g, ' '), end.replace(/_/g, ' ')],
                distance: 20,
                estimatedTime: '25 minutes'
            };

            const riskAssessment = await this.mlSystem.getRiskAssessment(
                routeData,
                { severity: 'moderate' },
                vehicle || null
            );

            res.json({
                ...riskAssessment,
                quickCheck: true,
                route: `${routeData.start} → ${routeData.destination}`
            });

        } catch (error) {
            console.error('❌ Quick risk check error:', error);
            res.status(500).json({
                success: false,
                error: 'Quick risk check failed',
                details: error.message
            });
        }
    }

    /**
     * Health check: GET /api/risk/health
     * Verify ML system is working
     */
    async healthCheck(req, res) {
        try {
            console.log('🏥 ML Health check...');

            // Test ML system with dummy data
            const testRoute = {
                start: 'Test Location A',
                destination: 'Test Location B',
                areas: ['Test Location A', 'Test Location B'],
                distance: 10,
                estimatedTime: '15 minutes'
            };

            const testResult = await this.mlSystem.getRiskAssessment(
                testRoute,
                { severity: 'low' },
                'Test Vehicle'
            );

            const healthStatus = {
                success: true,
                status: 'healthy',
                mlSystem: testResult.success ? 'operational' : 'degraded',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                features: {
                    prophetModels: true,
                    aiAnalysis: testResult.aiAnalysis ? true : false,
                    saDataIntegration: true
                }
            };

            res.json(healthStatus);

        } catch (error) {
            console.error('❌ Health check failed:', error);
            res.status(503).json({
                success: false,
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get risk factors: GET /api/risk/factors
     * Returns available risk categories and SA-specific data
     */
    async getRiskFactors(req, res) {
        try {
            const riskFactors = {
                success: true,
                riskTypes: {
                    weather: {
                        description: 'Weather-related vehicle damage (hail, flooding, storms)',
                        factors: ['hail_probability', 'rainfall_intensity', 'wind_speed', 'storm_severity']
                    },
                    crime: {
                        description: 'Vehicle crime including theft and hijacking',
                        factors: ['area_crime_rate', 'time_of_day', 'vehicle_vulnerability', 'route_risk']
                    },
                    accidents: {
                        description: 'Traffic accident probability',
                        factors: ['traffic_density', 'road_conditions', 'weather_impact', 'time_patterns']
                    },
                    theft: {
                        description: 'Vehicle-specific theft risk',
                        factors: ['vehicle_model_risk', 'area_theft_rate', 'parking_security', 'time_exposure']
                    }
                },
                southAfricanContext: {
                    highRiskAreas: ['Johannesburg CBD', 'Soweto', 'Alexandra', 'Hillbrow'],
                    mediumRiskAreas: ['Pretoria Central', 'Midrand'],
                    lowRiskAreas: ['Sandton', 'Centurion'],
                    highRiskVehicles: ['Toyota Hilux', 'VW Polo', 'BMW X5', 'Ford Ranger'],
                    seasonalPatterns: {
                        summer: 'High thunderstorm and hail risk (Oct-Mar)',
                        winter: 'Lower weather risk, increased crime in some areas (Apr-Sep)'
                    }
                },
                apiVersion: '1.0.0'
            };

            res.json(riskFactors);

        } catch (error) {
            console.error('❌ Get risk factors error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve risk factors'
            });
        }
    }
}

// Export controller instance
const riskController = new RiskController();

export const assessRisk = riskController.assessRisk.bind(riskController);
export const quickRiskCheck = riskController.quickRiskCheck.bind(riskController);
export const healthCheck = riskController.healthCheck.bind(riskController);
export const getRiskFactors = riskController.getRiskFactors.bind(riskController);