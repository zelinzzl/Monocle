import RiskCalculator from '../utils/riskCalculator.js';
import DataIntegrator from '../utils/dataIntegrator.js';
import RouteRiskService from '../utils/routeRiskService.js';

class MLRiskController {
  constructor() {
    this.riskCalculator = new RiskCalculator();
    this.dataIntegrator = new DataIntegrator();
    this.routeRiskService = new RouteRiskService();
  }

  /**
   * Get dashboard data for travel risk monitoring
   * GET /api/ml/dashboard
   */
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      
      // Get mock user vehicles and routes
      const vehicles = this.getMockVehicles(userId);
      const recentRoutes = this.routeRiskService.getMockUserRoutes(userId);
      
      // Analyze all routes
      const routeAnalysis = await this.routeRiskService.analyzeMultipleRoutes(recentRoutes, userId);
      
      // Get recent weather alerts
      const weatherAlerts = await this.routeRiskService.getRecentWeatherAlerts(userId);
      
      // Generate travel recommendations
      const recommendations = await this.routeRiskService.generateTravelRecommendations(routeAnalysis, vehicles);

      res.json({
        success: true,
        data: {
          summary: routeAnalysis.summary,
          routes: {
            protected: routeAnalysis.categorized.protected,
            atRisk: routeAnalysis.categorized.atRisk,
            monitored: routeAnalysis.categorized.monitored
          },
          recentAlerts: weatherAlerts,
          recommendations,
          vehicles: vehicles.filter(v => v.status === 'Active'),
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard',
        details: error.message
      });
    }
  }

  /**
   * Analyze specific route with real-time data
   * POST /api/ml/analyze-route
   */
  async analyzeSpecificRoute(req, res) {
    try {
      const { start, end, waypoints, vehicleId, routeName } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!start || !end) {
        return res.status(400).json({
          success: false,
          error: 'Start and end locations are required'
        });
      }

      const routeData = {
        start,
        end,
        waypoints: waypoints || [],
        vehicleId,
        routeName
      };

      // Analyze the route
      const analysis = await this.routeRiskService.analyzeSingleRoute(routeData, userId);

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      console.error('Route analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Route analysis failed',
        details: error.message
      });
    }
  }

  /**
   * Get weather predictions for location
   * GET /api/ml/weather-predictions/:lat/:lng
   */
  async getWeatherPredictions(req, res) {
    try {
      const { lat, lng } = req.params;
      const { days = 7 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      // Get weather data
      const weatherData = await this.dataIntegrator.getWeatherData(
        parseFloat(lat),
        parseFloat(lng),
        true
      );

      // Mock ML predictions for now
      const mlPredictions = this.generateMockPredictions(parseInt(days));

      res.json({
        success: true,
        data: {
          location: weatherData.location,
          current_weather: weatherData.current,
          forecast: weatherData.forecast,
          ml_predictions: mlPredictions,
          weather_alerts: weatherData.alerts,
          prediction_timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Weather predictions error:', error);
      res.status(500).json({
        success: false,
        error: 'Weather predictions failed',
        details: error.message
      });
    }
  }

  /**
   * Perform real-time risk assessment
   * POST /api/ml/risk-assessment
   */
  async performRiskAssessment(req, res) {
    try {
      const { vehicleId, currentLocation, routeData } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!vehicleId || !currentLocation) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle ID and current location are required'
        });
      }

      // Get mock vehicle data
      const vehicle = this.getMockVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }

      // Get weather data for current location
      const weatherData = await this.dataIntegrator.getWeatherData(
        currentLocation.lat, 
        currentLocation.lng
      );

      // Perform comprehensive risk assessment
      const riskAssessment = await this.riskCalculator.calculateRiskScore(
        vehicle,
        routeData || { coordinates: [currentLocation] },
        weatherData.current,
        false // Disable ML for now
      );

      // Get real-time alerts
      const alerts = await this.riskCalculator.getRealTimeAlerts(
        vehicle,
        currentLocation,
        weatherData.current
      );

      // Calculate claim probability
      const claimProbability = this.riskCalculator.calculateClaimProbability(
        vehicle,
        riskAssessment.riskFactors
      );

      res.json({
        success: true,
        data: {
          vehicle_id: vehicleId,
          risk_assessment: riskAssessment,
          real_time_alerts: alerts,
          weather_data: weatherData,
          claim_probability: {
            percentage: Math.round(claimProbability * 100),
            level: claimProbability > 0.3 ? 'High' : claimProbability > 0.15 ? 'Medium' : 'Low'
          },
          assessment_timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Risk assessment error:', error);
      res.status(500).json({
        success: false,
        error: 'Risk assessment failed',
        details: error.message
      });
    }
  }

  /**
   * Get weather alerts for specific area
   * GET /api/ml/weather-alerts/:lat/:lng
   */
  async getAreaWeatherAlerts(req, res) {
    try {
      const { lat, lng } = req.params;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      // Get weather data for the area
      const weatherData = await this.dataIntegrator.getWeatherData(
        parseFloat(lat),
        parseFloat(lng),
        true
      );

      // Mock predictions
      const predictions = this.generateMockPredictions(3);

      // Generate alerts
      const alerts = this.generateAreaAlerts(weatherData, predictions);

      res.json({
        success: true,
        data: {
          location: weatherData.location,
          currentWeather: weatherData.current,
          alerts,
          predictions,
          forecast: weatherData.forecast,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Weather alerts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get weather alerts',
        details: error.message
      });
    }
  }

  // Mock data generators for testing
  getMockVehicles(userId) {
    return [
      {
        id: 'vehicle_1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        main_driver_age: 35,
        primary_location: 'Johannesburg',
        coverage_amount: 300000,
        status: 'Active',
        policy_number: 'POL-12345'
      },
      {
        id: 'vehicle_2',
        make: 'BMW',
        model: 'X3',
        year: 2022,
        main_driver_age: 42,
        primary_location: 'Cape Town',
        coverage_amount: 800000,
        status: 'Active',
        policy_number: 'POL-67890'
      }
    ];
  }

  getMockVehicle(vehicleId) {
    const vehicles = this.getMockVehicles('user_1');
    return vehicles.find(v => v.id === vehicleId);
  }

  generateMockPredictions(days) {
    const predictions = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted_risk: Math.round(20 + Math.random() * 60),
        risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        confidence: Math.round(70 + Math.random() * 25)
      });
    }
    
    return predictions;
  }

  generateAreaAlerts(weatherData, predictions) {
    const alerts = [];
    
    // Check current weather
    if (weatherData.current?.precipitation > 15) {
      alerts.push({
        type: 'weather',
        severity: 'high',
        title: 'Heavy Rain Warning',
        message: 'Heavy rainfall detected in the area',
        timestamp: new Date().toISOString()
      });
    }

    if (weatherData.current?.wind_speed > 50) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        title: 'Strong Wind Alert',
        message: 'Strong winds may affect driving conditions',
        timestamp: new Date().toISOString()
      });
    }

    // Check predictions
    const highRiskPredictions = predictions.filter(p => p.predicted_risk > 70);
    if (highRiskPredictions.length > 0) {
      alerts.push({
        type: 'prediction',
        severity: 'medium',
        title: 'High Risk Forecast',
        message: `High risk conditions predicted for the next ${highRiskPredictions.length} day(s)`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }
}

export default MLRiskController;