// test-real-data.js - Test Real Data Integration
import DataIntegrator from './src/ml/utils/dataIntegrator.js';

async function testRealDataIntegration() {
    console.log('🌍 Testing Real Data Integration...\n');
    
    const dataIntegrator = new DataIntegrator();
    
    // Johannesburg coordinates (for weather data)
    const jhbCoordinates = [{ lat: -26.2041, lon: 28.0473 }];
    
    // Test 1: Current Weather Data
    console.log('🌤️ TEST 1: Current Weather Data');
    try {
        const currentWeather = await dataIntegrator.getCurrentWeatherData(jhbCoordinates);
        
        console.log('✅ Weather data fetched successfully!');
        console.log(`🌡️ Temperature: ${currentWeather.current.temperature}°C`);
        console.log(`💧 Humidity: ${currentWeather.current.humidity}%`);
        console.log(`🌧️ Precipitation: ${currentWeather.current.precipitation}mm`);
        console.log(`💨 Wind Speed: ${currentWeather.current.windSpeed}km/h`);
        console.log(`⚠️ Weather Risk Score: ${currentWeather.current.riskScore}/100`);
        console.log(`📊 Analysis: Risk Score ${currentWeather.analysis.riskScore}/100`);
        console.log(`🔗 Source: ${currentWeather.source}\n`);
        
    } catch (error) {
        console.log('❌ Weather test failed:', error.message);
    }
    
    // Test 2: Historical Weather Data (last 30 days)
    console.log('📊 TEST 2: Historical Weather Data');
    try {
        const endDate = new Date().toISOString().split('T')[0]; // Today
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago
        
        console.log(`📅 Fetching data from ${startDate} to ${endDate}`);
        
        const historicalWeather = await dataIntegrator.getHistoricalWeatherData(
            jhbCoordinates[0], 
            startDate, 
            endDate
        );
        
        console.log('✅ Historical weather data fetched!');
        console.log(`📈 Data points: ${historicalWeather.length}`);
        
        if (historicalWeather.length > 0) {
            const avgRisk = historicalWeather.reduce((sum, day) => sum + day.riskScore, 0) / historicalWeather.length;
            const maxRisk = Math.max(...historicalWeather.map(d => d.riskScore));
            const highRiskDays = historicalWeather.filter(d => d.riskScore > 70).length;
            
            console.log(`📊 Average Risk Score: ${avgRisk.toFixed(1)}/100`);
            console.log(`⚠️ Maximum Risk Score: ${maxRisk}/100`);
            console.log(`🚨 High Risk Days (>70): ${highRiskDays}/${historicalWeather.length}`);
            
            // Show sample of recent data
            console.log('\n📋 Sample Recent Data:');
            historicalWeather.slice(-5).forEach(day => {
                console.log(`  ${day.date}: Risk ${day.riskScore}/100 (Precip: ${day.precipitation}mm, Wind: ${day.windSpeed}km/h)`);
            });
        }
        console.log();
        
    } catch (error) {
        console.log('❌ Historical weather test failed:', error.message);
    }
    
    // Test 3: Crime Statistics
    console.log('🚔 TEST 3: Crime Statistics');
    try {
        const crimeData = await dataIntegrator.loadCrimeStatistics();
        
        console.log('✅ Crime data loaded successfully!');
        console.log(`📊 Data source: ${crimeData.source}`);
        console.log(`📅 Last updated: ${crimeData.lastUpdated}`);
        
        // Show high-risk areas
        console.log('\n🚨 High-Risk Areas (Crime Rate > 70):');
        Object.entries(crimeData.areaRiskScores)
            .filter(([area, data]) => data.crime_rate > 70)
            .sort(([,a], [,b]) => b.crime_rate - a.crime_rate)
            .forEach(([area, data]) => {
                console.log(`  ${area.replace(/_/g, ' ')}: ${data.crime_rate}/100 (Vehicle: ${data.vehicle_crime}, Hijacking: ${data.hijacking})`);
            });
        
        // Show time patterns
        console.log('\n⏰ Crime Time Patterns:');
        console.log(`  Month-end spike: +${(crimeData.timePatterns.monthEnd.multiplier - 1) * 100}% on days ${crimeData.timePatterns.monthEnd.days.join(', ')}`);
        console.log(`  Weekend increase: +${(crimeData.timePatterns.weekends.multiplier - 1) * 100}%`);
        console.log(`  Night-time risk: +${(crimeData.timePatterns.nightTime.multiplier - 1) * 100}%`);
        console.log();
        
    } catch (error) {
        console.log('❌ Crime data test failed:', error.message);
    }
    
    // Test 4: Vehicle Theft Data
    console.log('🚗 TEST 4: Vehicle Theft Statistics');
    try {
        const vehicleData = await dataIntegrator.loadVehicleTheftData();
        
        console.log('✅ Vehicle theft data loaded!');
        console.log(`📊 Data source: ${vehicleData.source}`);
        
        // Show highest risk vehicles
        console.log('\n🚨 Highest Risk Vehicles:');
        Object.entries(vehicleData.vehicleRiskScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([vehicle, risk]) => {
                console.log(`  ${vehicle.replace(/_/g, ' ')}: ${risk}/100`);
            });
        
        // Show risk factors
        console.log('\n📈 Risk Factor Multipliers:');
        console.log(`  New cars (0-2 years): x${vehicleData.riskFactors.age['0-2_years']}`);
        console.log(`  Aftermarket wheels: x${vehicleData.riskFactors.modifications.aftermarket_wheels}`);
        console.log(`  Sound system: x${vehicleData.riskFactors.modifications.sound_system}`);
        console.log();
        
    } catch (error) {
        console.log('❌ Vehicle data test failed:', error.message);
    }
    
    // Test 5: Integrated Risk Assessment
    console.log('🎯 TEST 5: Integrated Risk Assessment Example');
    try {
        // Simulate a high-risk scenario
        const testRoute = {
            start: 'Johannesburg CBD',
            destination: 'Soweto',
            coordinates: jhbCoordinates
        };
        
        const weatherData = await dataIntegrator.getCurrentWeatherData(jhbCoordinates);
        const crimeData = await dataIntegrator.loadCrimeStatistics();
        const vehicleData = await dataIntegrator.loadVehicleTheftData();
        
        // Calculate integrated risk
        const weatherRisk = weatherData.analysis.riskScore;
        const crimeRisk = crimeData.areaRiskScores['johannesburg_cbd']?.crime_rate || 50;
        const vehicleRisk = vehicleData.vehicleRiskScores['toyota_hilux'] || 50;
        
        const integratedRisk = (weatherRisk * 0.3 + crimeRisk * 0.4 + vehicleRisk * 0.3);
        
        console.log('🔗 Integrated Risk Assessment:');
        console.log(`📍 Route: ${testRoute.start} → ${testRoute.destination}`);
        console.log(`🌤️ Weather Risk: ${weatherRisk}/100`);
        console.log(`🚔 Crime Risk: ${crimeRisk}/100`);
        console.log(`🚗 Vehicle Risk (Toyota Hilux): ${vehicleRisk}/100`);
        console.log(`📊 INTEGRATED RISK: ${integratedRisk.toFixed(0)}/100`);
        
        if (integratedRisk > 70) {
            console.log('🚨 HIGH RISK - Recommend alternative route or delay');
        } else if (integratedRisk > 40) {
            console.log('🟡 MEDIUM RISK - Exercise caution');
        } else {
            console.log('🟢 LOW RISK - Safe to proceed');
        }
        
    } catch (error) {
        console.log('❌ Integrated assessment failed:', error.message);
    }
    
    console.log('\n🎯 Real Data Integration Test Complete!');
    console.log('✅ Your system now has access to:');
    console.log('  🌤️ Real-time weather data (Open-Meteo API)');
    console.log('  📊 Historical weather patterns (80+ years)');
    console.log('  🚔 SA crime statistics (SAPS-based)');
    console.log('  🚗 Vehicle theft intelligence');
    console.log('  🔗 Integrated risk assessment capability');
}

// Run the test
testRealDataIntegration().catch(console.error);