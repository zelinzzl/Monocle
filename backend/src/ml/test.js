// src/ml/test.js - Quick test to verify ML system works
import MLRiskSystem from './index.js';

async function testMLSystem() {
    console.log('🧪 Testing ML Risk System...\n');
    
    const mlSystem = new MLRiskSystem();
    
    // Test case 1: High-risk route
    console.log('📍 TEST 1: High-risk route (Johannesburg CBD → Soweto)');
    const highRiskRoute = {
        start: 'Johannesburg CBD',
        destination: 'Soweto',
        areas: ['Johannesburg CBD', 'Soweto'],
        distance: 25,
        estimatedTime: '45 minutes'
    };
    
    try {
        const result1 = await mlSystem.getRiskAssessment(
            highRiskRoute,
            { severity: 'moderate' },
            'Toyota Hilux'
        );
        
        if (result1.success) {
            console.log(`✅ Risk Level: ${result1.alert.color} ${result1.alert.level}`);
            console.log(`📊 Risk Score: ${result1.alert.riskScore}/100`);
            console.log(`💬 Alert: ${result1.alert.message}`);
            console.log(`🧠 AI Analysis: ${result1.aiAnalysis.analysis}`);
            console.log(`⚡ Powered by: ${result1.aiAnalysis.poweredBy}\n`);
        } else {
            console.log('❌ Test 1 failed:', result1.error);
        }
    } catch (error) {
        console.log('❌ Test 1 error:', error.message);
    }
    
    // Test case 2: Low-risk route
    console.log('📍 TEST 2: Low-risk route (Sandton → Centurion)');
    const lowRiskRoute = {
        start: 'Sandton',
        destination: 'Centurion',
        areas: ['Sandton', 'Centurion'],
        distance: 20,
        estimatedTime: '30 minutes'
    };
    
    try {
        const result2 = await mlSystem.getRiskAssessment(
            lowRiskRoute,
            { severity: 'low' },
            'Toyota Corolla'
        );
        
        if (result2.success) {
            console.log(`✅ Risk Level: ${result2.alert.color} ${result2.alert.level}`);
            console.log(`📊 Risk Score: ${result2.alert.riskScore}/100`);
            console.log(`💬 Alert: ${result2.alert.message}`);
            console.log(`🧠 AI Analysis: ${result2.aiAnalysis.analysis}`);
            console.log(`⚡ Powered by: ${result2.aiAnalysis.poweredBy}\n`);
        } else {
            console.log('❌ Test 2 failed:', result2.error);
        }
    } catch (error) {
        console.log('❌ Test 2 error:', error.message);
    }
    
    console.log('🎯 ML System Test Complete!');
    console.log('✅ Ready for API integration');
}

// Run the test
testMLSystem().catch(console.error);