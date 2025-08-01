// src/routes/riskRoutes.js - API Routes for Risk Assessment
import express from 'express';
import { assessRisk, quickRiskCheck, healthCheck, getRiskFactors } from '../controllers/riskController.js';

const router = express.Router();

// Main risk assessment endpoint
// POST /api/risk/assess
// Body: { startLocation, endLocation, vehicleType?, travelTime?, routeData?, weatherData? }
router.post('/assess', assessRisk);

// Quick risk check for demos
// GET /api/risk/quick/:start/:end?vehicle=Toyota_Hilux
router.get('/quick/:start/:end', quickRiskCheck);

// Health check endpoint
// GET /api/risk/health
router.get('/health', healthCheck);

// Get available risk factors and SA data
// GET /api/risk/factors
router.get('/factors', getRiskFactors);

// Demo endpoint with sample data
// GET /api/risk/demo
router.get('/demo', async (req, res) => {
    try {
        console.log('🎬 Demo endpoint called');
        
        const demoScenarios = [
            {
                name: 'High Risk Scenario',
                description: 'Johannesburg CBD to Soweto with high-risk vehicle',
                request: {
                    startLocation: 'Johannesburg CBD',
                    endLocation: 'Soweto',
                    vehicleType: 'Toyota Hilux'
                }
            },
            {
                name: 'Medium Risk Scenario', 
                description: 'Pretoria to Midrand during evening',
                request: {
                    startLocation: 'Pretoria Central',
                    endLocation: 'Midrand',
                    vehicleType: 'VW Polo',
                    travelTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
                }
            },
            {
                name: 'Low Risk Scenario',
                description: 'Sandton to Centurion with low-risk vehicle',
                request: {
                    startLocation: 'Sandton',
                    endLocation: 'Centurion', 
                    vehicleType: 'Toyota Corolla'
                }
            }
        ];

        res.json({
            success: true,
            message: 'Demo scenarios available',
            scenarios: demoScenarios,
            usage: {
                assessRisk: 'POST /api/risk/assess with scenario.request as body',
                quickCheck: 'GET /api/risk/quick/Sandton/Centurion?vehicle=Toyota_Corolla'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Demo endpoint failed'
        });
    }
});

export default router;