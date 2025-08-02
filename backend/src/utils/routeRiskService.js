import DataIntegrator from './dataIntegrator.js';
import RiskCalculator from './riskCalculator.js';

class RouteRiskService {
  constructor() {
    this.dataIntegrator = new DataIntegrator();
    this.riskCalculator = new RiskCalculator();
  }

  /**
   * Analyze multiple routes for dashboard display
   */
  async analyzeMultipleRoutes(routes, userId) {
    try {
      const routeAnalyses = await Promise.all(
        routes.map(route => this.analyzeSingleRoute(route, userId))
      );

      // Categorize routes by risk level
      const categorized = this.categorizeRoutes(routeAnalyses);
      
      // Generate dashboard summary
      const dashboardData = this.generateDashboardSummary(categorized);

      return {
        routes: routeAnalyses,
        summary: dashboardData,
        categorized,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Multiple route analysis error:', error);
      throw new Error('Failed to analyze multiple routes');
    }
  }

  /**
   * Analyze single route with real-time data
   */
  async analyzeSingleRoute(routeData, userId) {
    try {
      const { start, end, waypoints = [], vehicleId, routeName } = routeData;
      
      // Get basic route information
      const basicRoute = this.getBasicRouteData(start, end, waypoints);
      
      // Get weather data along the route
      const routeWeather = await this.getRouteWeatherConditions([start, end]);
      
      // Calculate risk assessment
      const riskAssessment = await this.calculateBasicRouteRisk(basicRoute, routeWeather, vehicleId, userId);

      return {
        routeId: routeData.routeId || this.generateRouteId(start, end),
        routeName: routeName || `${start.name || 'Start'} to ${end.name || 'End'}`,
        route: basicRoute,
        weather: routeWeather,
        riskAssessment,
        realTimeAlerts: this.generateBasicAlerts(riskAssessment, routeWeather),
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Single route analysis error:', error);
      return this.getBasicRouteAnalysis(routeData);
    }
  }

  /**
   * Get basic route data (fallback when Google Maps not available)
   */
  getBasicRouteData(start, end, waypoints) {
    const distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
    return {
      distance,
      duration: distance * 1.2, // Rough estimate
      durationInTraffic: distance * 1.4,
      path: [start, ...waypoints, end],
      trafficDelay: distance * 0.2 * 60, // seconds
      source: 'basic_calculation'
    };
  }

  /**
   * Get weather conditions along route
   */
  async getRouteWeatherConditions(routePoints) {
    try {
      const weatherPromises = routePoints.map(point =>
        this.dataIntegrator.getWeatherData(point.lat, point.lng, false)
      );

      const weatherData = await Promise.all(weatherPromises);
      
      return {
        points: weatherData,
        aggregated: this.aggregateWeatherData(weatherData),
        alerts: this.generateWeatherAlerts(weatherData),
        riskScore: this.calculateWeatherRisk(weatherData)
      };

    } catch (error) {
      console.error('Route weather error:', error);
      return { points: [], aggregated: null, alerts: [], riskScore: 0 };
    }
  }

  /**
   * Calculate basic route risk
   */
  async calculateBasicRouteRisk(route, weather, vehicleId, userId) {
    try {
      // Get vehicle data if available
      let vehicleData = this.getDefaultVehicle();
      if (vehicleId && userId) {
        try {
          // Simplified vehicle data fetch - remove dynamic import
          vehicleData = {
            id: vehicleId,
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            main_driver_age: 35,
            primary_location: 'Johannesburg',
            coverage_amount: 300000
          };
        } catch (error) {
          console.warn('Could not fetch vehicle data:', error.message);
        }
      }

      // Calculate risk using existing calculator
      const routeRiskData = {
        coordinates: route.path || [],
        distance: route.distance,
        duration: route.duration
      };

      const baseRisk = await this.riskCalculator.calculateRiskScore(
        vehicleData,
        routeRiskData,
        weather.aggregated || {},
        false // Don't use ML for basic version
      );

      return {
        overallRiskScore: baseRisk.overallRiskScore,
        riskLevel: baseRisk.riskLevel,
        riskFactors: baseRisk.riskFactors,
        recommendations: baseRisk.recommendations,
        confidence: 0.7 // Basic confidence level
      };

    } catch (error) {
      console.error('Route risk calculation error:', error);
      return {
        overallRiskScore: 50,
        riskLevel: 'Medium',
        riskFactors: {},
        recommendations: [],
        confidence: 0.5
      };
    }
  }

  /**
   * Categorize routes by risk level
   */
  categorizeRoutes(routeAnalyses) {
    const categorized = {
      protected: [],
      atRisk: [],
      monitored: []
    };

    routeAnalyses.forEach(route => {
      const riskScore = route.riskAssessment.overallRiskScore;
      
      if (riskScore < 30) {
        categorized.protected.push(route);
      } else if (riskScore >= 30 && riskScore < 70) {
        categorized.atRisk.push(route);
      } else {
        categorized.monitored.push(route);
      }
    });

    return categorized;
  }

  /**
   * Generate dashboard summary
   */
  generateDashboardSummary(categorized) {
    const total = categorized.protected.length + categorized.atRisk.length + categorized.monitored.length;
    
    return {
      protectedRoutes: {
        count: categorized.protected.length,
        description: "Routes with minimal weather risks"
      },
      atRiskRoutes: {
        count: categorized.atRisk.length,
        description: "Routes with potential weather hazards"
      },
      monitoredVehicles: {
        count: categorized.monitored.length,
        description: "Routes currently being tracked"
      },
      riskBreakdown: {
        criticalRisk: categorized.monitored.filter(r => r.riskAssessment.riskLevel === 'Critical').length,
        highRisk: categorized.monitored.filter(r => r.riskAssessment.riskLevel === 'High').length,
        mediumRisk: categorized.atRisk.filter(r => r.riskAssessment.riskLevel === 'Medium').length,
        goodConditions: categorized.protected.length
      },
      riskMitigation: {
        percentage: Math.round((categorized.protected.length / total) * 100) || 0,
        message: "Consider rescheduling travel for high-risk routes."
      }
    };
  }

  // Helper methods
  generateRouteId(start, end) {
    return `route_${start.lat}_${start.lng}_to_${end.lat}_${end.lng}`.replace(/\./g, '_');
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  getDefaultVehicle() {
    return {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      main_driver_age: 35,
      primary_location: 'Johannesburg',
      coverage_amount: 300000
    };
  }

  aggregateWeatherData(weatherData) {
    if (!weatherData || weatherData.length === 0) return null;
    
    return {
      maxTemp: Math.max(...weatherData.map(w => w.current?.temperature || 20)),
      minTemp: Math.min(...weatherData.map(w => w.current?.temperature || 20)),
      maxPrecipitation: Math.max(...weatherData.map(w => w.current?.precipitation || 0)),
      avgWindSpeed: weatherData.reduce((sum, w) => sum + (w.current?.wind_speed || 0), 0) / weatherData.length
    };
  }

  generateWeatherAlerts(weatherData) {
    const alerts = [];
    
    weatherData.forEach((weather, index) => {
      if (weather.current?.precipitation > 10) {
        alerts.push({
          type: 'heavy_rain',
          severity: 'medium',
          message: `Heavy rain detected along route`,
          location: weather.location
        });
      }
    });
    
    return alerts;
  }

  calculateWeatherRisk(weatherData) {
    if (!weatherData || weatherData.length === 0) return 0;
    
    const risks = weatherData.map(weather => {
      let risk = 0;
      if (weather.current?.precipitation > 20) risk += 30;
      if (weather.current?.wind_speed > 60) risk += 25;
      if (weather.current?.visibility < 3) risk += 20;
      return risk;
    });
    
    return Math.max(...risks);
  }

  generateBasicAlerts(riskAssessment, weather) {
    const alerts = [];

    if (riskAssessment.overallRiskScore > 70) {
      alerts.push({
        type: 'high_risk',
        severity: 'high',
        title: 'High Risk Route',
        message: 'This route has elevated risk factors.',
        timestamp: new Date().toISOString()
      });
    }

    if (weather.alerts && weather.alerts.length > 0) {
      alerts.push(...weather.alerts);
    }

    return alerts;
  }

  getBasicRouteAnalysis(routeData) {
    return {
      routeId: this.generateRouteId(routeData.start, routeData.end),
      routeName: routeData.routeName || 'Basic Route',
      route: this.getBasicRouteData(routeData.start, routeData.end, routeData.waypoints || []),
      riskAssessment: {
        overallRiskScore: 50,
        riskLevel: 'Medium',
        riskFactors: {},
        recommendations: []
      },
      realTimeAlerts: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Mock methods for testing
  getMockUserRoutes(userId) {
    return [
      {
        routeId: 'route_1',
        routeName: 'Home to Work',
        start: { lat: -26.2041, lng: 28.0473, name: 'Johannesburg' },
        end: { lat: -26.1076, lng: 28.0567, name: 'Sandton' },
        waypoints: [],
        vehicleId: 'vehicle_1'
      },
      {
        routeId: 'route_2', 
        routeName: 'Shopping Trip',
        start: { lat: -26.1076, lng: 28.0567, name: 'Sandton' },
        end: { lat: -26.0908, lng: 28.0567, name: 'Rosebank' },
        waypoints: [],
        vehicleId: 'vehicle_1'
      }
    ];
  }

  async getRecentWeatherAlerts(userId) {
    return [
      {
        type: 'weather',
        severity: 'medium',
        message: 'Thunderstorm warning for Johannesburg area',
        timestamp: new Date().toISOString()
      }
    ];
  }

  async generateTravelRecommendations(routeAnalysis, vehicles) {
    return [
      {
        category: 'timing',
        message: 'Best travel time: 10:00 AM - 2:00 PM',
        priority: 'medium'
      },
      {
        category: 'route',
        message: 'Consider alternative route due to weather conditions',
        priority: 'high'
      }
    ];
  }
}

export default RouteRiskService;