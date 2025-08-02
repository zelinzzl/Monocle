// services/mlService.ts
import { apiFetch } from './api';

export interface MLDashboardData {
  summary: {
    protectedRoutes: {
      count: number;
      description: string;
    };
    atRiskRoutes: {
      count: number;
      description: string;
    };
    monitoredVehicles: {
      count: number;
      description: string;
    };
    riskBreakdown: {
      criticalRisk: number;
      highRisk: number;
      mediumRisk: number;
      goodConditions: number;
    };
    riskMitigation: {
      percentage: number;
      message: string;
    };
  };
  routes: {
    protected: any[];
    atRisk: any[];
    monitored: any[];
  };
  recentAlerts: any[];
  recommendations: any[];
  vehicles: any[];
  lastUpdated: string;
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  location: string;
  timestamp: string;
  time?: string; // for display
  icon?: React.ReactNode;
}

export interface RouteRiskData {
  critical: number;
  high: number;
  medium: number;
  good: number;
}

export interface RiskAssessment {
  vehicle_id: string;
  risk_assessment: {
    overallRiskScore: number;
    riskLevel: string;
    riskFactors: any;
    recommendations: any[];
  };
  real_time_alerts: {
    alerts: any[];
    overallRiskScore: number;
    riskLevel: string;
  };
  weather_data: any;
  claim_probability: {
    percentage: number;
    level: string;
  };
  assessment_timestamp: string;
}

class MLService {
  // Get ML dashboard data
  async getDashboardData(): Promise<MLDashboardData> {
    try {
      const response = await apiFetch('/api/ml/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching ML dashboard data:', error);
      throw error;
    }
  }

  // Get weather predictions for a location
  async getWeatherPredictions(lat: number, lng: number, days: number = 7) {
    try {
      const response = await apiFetch(`/api/ml/weather-predictions/${lat}/${lng}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather predictions:', error);
      throw error;
    }
  }

  // Get weather alerts for a location
  async getWeatherAlerts(lat: number, lng: number) {
    try {
      const response = await apiFetch(`/api/ml/weather-alerts/${lat}/${lng}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  }

  // Analyze a specific route
  async analyzeRoute(routeData: {
    start: { lat: number; lng: number; name?: string };
    end: { lat: number; lng: number; name?: string };
    waypoints?: { lat: number; lng: number }[];
    vehicleId: string;
    routeName?: string;
  }) {
    try {
      // Ensure name properties are defined for the API call
      const formattedRouteData = {
        start: {
          lat: routeData.start.lat,
          lng: routeData.start.lng,
          name: routeData.start.name || 'Start Location'
        },
        end: {
          lat: routeData.end.lat,
          lng: routeData.end.lng,
          name: routeData.end.name || 'End Location'
        },
        waypoints: routeData.waypoints || [],
        vehicleId: routeData.vehicleId,
        routeName: routeData.routeName || `${routeData.start.name || 'Start'} to ${routeData.end.name || 'End'}`
      };

      const response = await apiFetch('/api/ml/analyze-route', {
        method: 'POST',
        body: JSON.stringify(formattedRouteData),
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing route:', error);
      throw error;
    }
  }

  // Perform risk assessment
  async performRiskAssessment(assessmentData: {
    vehicleId: string;
    currentLocation: { lat: number; lng: number };
    routeData?: {
      coordinates: { lat: number; lng: number }[];
      distance?: number;
      duration?: number;
    };
  }): Promise<RiskAssessment> {
    try {
      const response = await apiFetch('/api/ml/risk-assessment', {
        method: 'POST',
        body: JSON.stringify(assessmentData),
      });
      return response.data;
    } catch (error) {
      console.error('Error performing risk assessment:', error);
      throw error;
    }
  }

  // Convert ML alerts to frontend format
  formatAlertsForDashboard(mlAlerts: any[], weatherAlerts: any[] = []): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    // Process ML alerts
    mlAlerts.forEach((alert, index) => {
      alerts.push({
        id: `ml-${index}`,
        type: alert.type || 'weather',
        severity: alert.severity || 'medium',
        title: alert.title || alert.message,
        message: alert.message,
        location: alert.location || 'Unknown location',
        timestamp: alert.timestamp || new Date().toISOString(),
        time: this.formatTimeAgo(alert.timestamp),
      });
    });

    // Process weather alerts
    weatherAlerts.forEach((alert, index) => {
      alerts.push({
        id: `weather-${index}`,
        type: 'weather',
        severity: alert.severity || 'medium',
        title: alert.type || 'Weather Alert',
        message: alert.message || alert.recommendation,
        location: 'Weather Service',
        timestamp: new Date().toISOString(),
        time: 'Now',
      });
    });

    return alerts.slice(0, 10); // Limit to 10 most recent
  }

  // Convert ML dashboard data to frontend route risk format
  formatRouteRiskData(mlData: MLDashboardData): RouteRiskData {
    const breakdown = mlData.summary.riskBreakdown;
    return {
      critical: breakdown.criticalRisk || 0,
      high: breakdown.highRisk || 0,
      medium: breakdown.mediumRisk || 0,
      good: breakdown.goodConditions || 0,
    };
  }

  // Format recommendations for dashboard
  formatRecommendations(mlRecommendations: any[]): string[] {
    return mlRecommendations.map(rec => {
      const priority = rec.priority === 'critical' ? '🔴' : 
                     rec.priority === 'high' ? '🟠' : 
                     rec.priority === 'medium' ? '🟡' : '🟢';
      
      return `${priority} ${rec.message || rec.action}`;
    }).slice(0, 5); // Limit to 5 recommendations
  }

  // Get comprehensive dashboard data
  async getComprehensiveDashboardData() {
    try {
      // Get ML dashboard data
      const mlDashboard = await this.getDashboardData();

      // Get weather alerts for major SA cities
      const johannesburgAlerts = await this.getWeatherAlerts(-26.2041, 28.0473);
      const capeTownAlerts = await this.getWeatherAlerts(-33.9249, 18.4241);
      const durbanAlerts = await this.getWeatherAlerts(-29.8587, 31.0218);

      // Combine all alerts
      const allAlerts = [
        ...johannesburgAlerts.alerts,
        ...capeTownAlerts.alerts,
        ...durbanAlerts.alerts,
      ];

      return {
        mlDashboard,
        formattedAlerts: this.formatAlertsForDashboard(mlDashboard.recentAlerts, allAlerts),
        routeRiskData: this.formatRouteRiskData(mlDashboard),
        recommendations: this.formatRecommendations(mlDashboard.recommendations),
        summary: {
          protectedRoutes: mlDashboard.summary.protectedRoutes.count,
          atRiskRoutes: mlDashboard.summary.atRiskRoutes.count + mlDashboard.summary.monitoredVehicles.count,
          monitoredVehicles: mlDashboard.vehicles.length,
          riskMitigation: mlDashboard.summary.riskMitigation.percentage,
        },
      };
    } catch (error) {
      console.error('Error getting comprehensive dashboard data:', error);
      
      // Return fallback data if ML service fails
      return this.getFallbackDashboardData();
    }
  }

  // Fallback data for when ML service is unavailable
  private getFallbackDashboardData() {
    return {
      mlDashboard: null,
      formattedAlerts: [
        {
          id: 'fallback-1',
          type: 'system',
          severity: 'medium',
          title: 'ML Service Unavailable',
          message: 'Risk assessment service is temporarily offline',
          location: 'System',
          timestamp: new Date().toISOString(),
          time: 'Now',
        },
      ],
      routeRiskData: {
        critical: 5,
        high: 10,
        medium: 15,
        good: 20,
      },
      recommendations: [
        '🟡 ML risk assessment service is currently offline',
        '🟢 Basic weather monitoring is still active',
        '🟡 Check back in a few minutes for full risk analysis',
      ],
      summary: {
        protectedRoutes: 20,
        atRiskRoutes: 30,
        monitoredVehicles: 5,
        riskMitigation: 67,
      },
    };
  }

  // Utility function to format timestamp
  private formatTimeAgo(timestamp: string): string {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  }

  // Get current location and perform risk assessment
  async getCurrentLocationRiskAssessment(): Promise<RiskAssessment | null> {
    try {
      // Get user's current location
      const position = await this.getCurrentPosition();
      
      // Perform risk assessment for current location
      const assessment = await this.performRiskAssessment({
        vehicleId: 'vehicle_1', // Default vehicle
        currentLocation: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      });

      return assessment;
    } catch (error) {
      console.error('Error getting current location risk assessment:', error);
      return null;
    }
  }

  // Get current position using Geolocation API
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }
}

export const mlService = new MLService();