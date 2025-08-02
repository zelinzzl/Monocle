import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RiskCalculator {
  constructor() {
    this.safetyThresholds = {
      weather: {
        precipitation: { low: 2, medium: 10, high: 20 },
        windSpeed: { low: 25, medium: 40, high: 60 },
        visibility: { high: 5, medium: 3, low: 1 },
        temperature: { min: 5, max: 35 }
      },
      vehicle: {
        age: { new: 3, moderate: 7, old: 15 },
        value: { low: 150000, medium: 400000, high: 800000 }
      }
    };

    // South African crime hotspots
    this.saHotspots = [
      { name: 'Johannesburg CBD', lat: -26.2041, lng: 28.0473, riskLevel: 85 },
      { name: 'Hillbrow', lat: -26.1849, lng: 28.0488, riskLevel: 90 },
      { name: 'Alexandra', lat: -26.1009, lng: 28.0963, riskLevel: 80 },
      { name: 'Soweto', lat: -26.2678, lng: 27.8546, riskLevel: 70 },
      { name: 'Cape Flats', lat: -34.0299, lng: 18.6248, riskLevel: 85 },
      { name: 'Mitchells Plain', lat: -34.0364, lng: 18.6248, riskLevel: 75 },
      { name: 'Khayelitsha', lat: -34.0500, lng: 18.6820, riskLevel: 80 },
      { name: 'Durban Central', lat: -29.8587, lng: 31.0218, riskLevel: 65 },
      { name: 'Umlazi', lat: -29.9729, lng: 30.8827, riskLevel: 70 },
      { name: 'Phoenix', lat: -29.7008, lng: 31.0169, riskLevel: 75 }
    ];

    // Time-based risk factors
    this.timeRiskFactors = {
      hourly: {
        0: 15, 1: 20, 2: 25, 3: 30, 4: 25, 5: 15,
        6: 10, 7: 5, 8: 8, 9: 5, 10: 5, 11: 5,
        12: 8, 13: 5, 14: 5, 15: 8, 16: 10, 17: 15,
        18: 20, 19: 25, 20: 30, 21: 25, 22: 20, 23: 18
      },
      weekly: {
        0: 10, 1: 5, 2: 5, 3: 5, 4: 8, 5: 15, 6: 20
      }
    };
  }

  /**
   * Calculate comprehensive risk score for a vehicle and route
   */
  async calculateRiskScore(vehicleData, routeData, weatherData, useML = false) {
    try {
      let riskScore = 0;
      let riskFactors = {};

      // Base vehicle risk
      const vehicleRisk = this.calculateVehicleRisk(vehicleData);
      riskScore += vehicleRisk.score;
      riskFactors.vehicle = vehicleRisk;

      // Weather risk
      const weatherRisk = this.calculateWeatherRisk(weatherData);
      riskScore += weatherRisk.score;
      riskFactors.weather = weatherRisk;

      // Location/crime risk
      const locationRisk = this.calculateLocationRisk(routeData);
      riskScore += locationRisk.score;
      riskFactors.location = locationRisk;

      // Time-based risk
      const timeRisk = this.calculateTimeRisk();
      riskScore += timeRisk.score;
      riskFactors.time = timeRisk;

      // Skip ML for now to avoid Python dependency issues
      if (useML) {
        console.log('ML predictions skipped for stability');
      }

      // Normalize to 0-100 scale
      riskScore = Math.max(0, Math.min(100, riskScore));

      return {
        overallRiskScore: Math.round(riskScore * 100) / 100,
        riskLevel: this.getRiskLevel(riskScore),
        riskFactors,
        recommendations: this.generateRecommendations(riskScore, riskFactors),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calculating risk score:', error);
      throw new Error('Risk calculation failed');
    }
  }

  /**
   * Calculate vehicle-specific risk factors
   */
  calculateVehicleRisk(vehicleData) {
    let score = 0;
    let factors = [];

    const { make, model, year, main_driver_age, primary_location } = vehicleData;
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - year;
    const driverAge = main_driver_age;

    // Vehicle age factor
    if (vehicleAge <= this.safetyThresholds.vehicle.age.new) {
      score += 5;
      factors.push('New vehicle - higher theft target');
    } else if (vehicleAge <= this.safetyThresholds.vehicle.age.moderate) {
      score += 0;
    } else if (vehicleAge <= this.safetyThresholds.vehicle.age.old) {
      score += 10;
      factors.push('Older vehicle - increased breakdown risk');
    } else {
      score += 20;
      factors.push('Very old vehicle - high maintenance risk');
    }

    // Driver age factor
    if (driverAge < 21) {
      score += 25;
      factors.push('Very young driver - highest accident risk');
    } else if (driverAge < 25) {
      score += 20;
      factors.push('Young driver - high accident risk');
    } else if (driverAge < 30) {
      score += 10;
      factors.push('Young adult driver - moderate risk');
    } else if (driverAge <= 60) {
      score += 0;
    } else {
      score += 8;
      factors.push('Senior driver - slightly elevated risk');
    }

    // Vehicle make/model risk
    const highRiskMakes = ['bmw', 'mercedes', 'audi', 'volkswagen', 'toyota hilux'];
    const makeModel = `${make} ${model}`.toLowerCase();
    
    if (highRiskMakes.some(risk => makeModel.includes(risk))) {
      score += 10;
      factors.push('High-value/frequently stolen vehicle model');
    }

    return {
      score: Math.min(40, score),
      factors,
      details: {
        vehicleAge,
        driverAge,
        riskCategory: vehicleAge <= 3 ? 'new' : vehicleAge <= 7 ? 'moderate' : 'old'
      }
    };
  }

  /**
   * Calculate weather-based risk factors
   */
  calculateWeatherRisk(weatherData) {
    if (!weatherData) {
      return { score: 10, factors: ['No weather data available'], details: {} };
    }

    let score = 0;
    let factors = [];
    const { temperature, precipitation, wind_speed, visibility, humidity } = weatherData;

    // Precipitation risk
    if (precipitation >= this.safetyThresholds.weather.precipitation.high) {
      score += 30;
      factors.push('Heavy rainfall - severe driving hazard');
    } else if (precipitation >= this.safetyThresholds.weather.precipitation.medium) {
      score += 15;
      factors.push('Moderate rainfall - reduced traction');
    } else if (precipitation >= this.safetyThresholds.weather.precipitation.low) {
      score += 5;
      factors.push('Light rainfall - minor hazard');
    }

    // Wind speed risk
    if (wind_speed >= this.safetyThresholds.weather.windSpeed.high) {
      score += 25;
      factors.push('Extreme winds - vehicle control risk');
    } else if (wind_speed >= this.safetyThresholds.weather.windSpeed.medium) {
      score += 12;
      factors.push('Strong winds - steering difficulty');
    } else if (wind_speed >= this.safetyThresholds.weather.windSpeed.low) {
      score += 5;
      factors.push('Moderate winds - caution advised');
    }

    // Visibility risk
    if (visibility <= this.safetyThresholds.weather.visibility.low) {
      score += 35;
      factors.push('Extremely poor visibility - dangerous');
    } else if (visibility <= this.safetyThresholds.weather.visibility.medium) {
      score += 20;
      factors.push('Poor visibility - high risk');
    } else if (visibility <= this.safetyThresholds.weather.visibility.high) {
      score += 8;
      factors.push('Reduced visibility - moderate risk');
    }

    // Temperature extremes
    if (temperature <= this.safetyThresholds.weather.temperature.min || 
        temperature >= this.safetyThresholds.weather.temperature.max) {
      score += 8;
      factors.push('Extreme temperature - vehicle stress');
    }

    // High humidity
    if (humidity && humidity > 90) {
      score += 5;
      factors.push('High humidity - potential visibility issues');
    }

    return {
      score: Math.min(50, score),
      factors,
      details: {
        precipitation,
        wind_speed,
        visibility,
        temperature,
        severity: score > 30 ? 'severe' : score > 15 ? 'moderate' : 'low'
      }
    };
  }

  /**
   * Calculate location-based risk
   */
  calculateLocationRisk(routeData) {
    if (!routeData || !routeData.coordinates) {
      return { score: 10, factors: ['No route data available'], details: {} };
    }

    let score = 0;
    let factors = [];
    let hotspotMatches = [];

    // Check route against known crime hotspots
    routeData.coordinates.forEach(coord => {
      this.saHotspots.forEach(hotspot => {
        const distance = this.calculateDistance(
          coord.lat, coord.lng,
          hotspot.lat, hotspot.lng
        );

        if (distance <= 5) {
          const proximityScore = Math.max(0, (5 - distance) / 5 * hotspot.riskLevel / 10);
          score += proximityScore;
          
          if (distance <= 2) {
            hotspotMatches.push({
              name: hotspot.name,
              distance: distance.toFixed(1),
              riskLevel: hotspot.riskLevel
            });
            factors.push(`Route passes near high-crime area: ${hotspot.name}`);
          }
        }
      });
    });

    // Route length factor
    const routeLength = routeData.distance || this.estimateRouteDistance(routeData.coordinates);
    if (routeLength > 200) {
      score += 10;
      factors.push('Long distance route - extended exposure');
    } else if (routeLength > 100) {
      score += 5;
      factors.push('Medium distance route - moderate exposure');
    }

    // Urban vs rural factor
    const isUrban = this.isUrbanRoute(routeData);
    if (isUrban) {
      score += 5;
      factors.push('Urban route - traffic and crime risk');
    } else {
      score += 8;
      factors.push('Rural route - limited emergency services');
    }

    return {
      score: Math.min(35, score),
      factors,
      details: {
        hotspotMatches,
        routeLength: routeLength.toFixed(1),
        isUrban,
        riskCategory: score > 20 ? 'high' : score > 10 ? 'moderate' : 'low'
      }
    };
  }

  /**
   * Calculate time-based risk factors
   */
  calculateTimeRisk() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let score = 0;
    let factors = [];

    const hourlyRisk = this.timeRiskFactors.hourly[hour] || 5;
    score += hourlyRisk * 0.5;

    const weeklyRisk = this.timeRiskFactors.weekly[dayOfWeek] || 5;
    score += weeklyRisk * 0.3;

    // Add contextual factors
    if (hour >= 22 || hour <= 4) {
      factors.push('Late night/early morning - highest crime risk');
    } else if (hour >= 18 && hour <= 21) {
      factors.push('Evening hours - elevated crime risk');
    } else if (hour >= 6 && hour <= 8) {
      factors.push('Morning rush hour - traffic congestion');
    } else if (hour >= 16 && hour <= 18) {
      factors.push('Afternoon rush hour - traffic congestion');
    }

    if (dayOfWeek === 5 || dayOfWeek === 6) {
      factors.push('Weekend - higher accident rates');
    }

    return {
      score: Math.min(15, score),
      factors,
      details: {
        currentHour: hour,
        dayOfWeek,
        hourlyRisk,
        weeklyRisk,
        timeCategory: hour >= 22 || hour <= 4 ? 'high_risk' : 
                     hour >= 6 && hour <= 18 ? 'moderate_risk' : 'normal'
      }
    };
  }

  /**
   * Generate risk-based recommendations
   */
  generateRecommendations(riskScore, riskFactors) {
    let recommendations = [];

    // Weather-based recommendations
    if (riskFactors.weather && riskFactors.weather.score > 20) {
      recommendations.push({
        category: 'weather',
        priority: 'high',
        message: 'Severe weather conditions detected. Consider postponing travel or taking alternative route.',
        actions: ['Check weather updates', 'Reduce speed', 'Increase following distance']
      });
    } else if (riskFactors.weather && riskFactors.weather.score > 10) {
      recommendations.push({
        category: 'weather',
        priority: 'medium',
        message: 'Moderate weather risk. Drive with caution.',
        actions: ['Monitor weather conditions', 'Use headlights', 'Reduce speed in poor visibility']
      });
    }

    // Location-based recommendations
    if (riskFactors.location && riskFactors.location.score > 20) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        message: 'Route passes through high-crime areas. Take extra security precautions.',
        actions: ['Lock doors and windows', 'Avoid stops in high-risk areas', 'Consider alternative route', 'Travel in convoy if possible']
      });
    }

    // Time-based recommendations
    if (riskFactors.time && riskFactors.time.details.timeCategory === 'high_risk') {
      recommendations.push({
        category: 'timing',
        priority: 'medium',
        message: 'Traveling during high-risk hours. Extra vigilance required.',
        actions: ['Stay alert', 'Avoid isolated areas', 'Keep fuel tank above half', 'Inform someone of your route']
      });
    }

    // Vehicle-based recommendations
    if (riskFactors.vehicle && riskFactors.vehicle.score > 15) {
      recommendations.push({
        category: 'vehicle',
        priority: 'medium',
        message: 'Vehicle profile indicates elevated risk factors.',
        actions: ['Ensure vehicle maintenance is up to date', 'Check tire condition', 'Verify insurance coverage']
      });
    }

    // Overall risk recommendations
    if (riskScore > 70) {
      recommendations.unshift({
        category: 'overall',
        priority: 'critical',
        message: 'CRITICAL RISK LEVEL: Strongly recommend postponing travel or finding alternative transportation.',
        actions: ['Postpone travel if possible', 'Consider public transport', 'Wait for conditions to improve']
      });
    } else if (riskScore > 50) {
      recommendations.unshift({
        category: 'overall',
        priority: 'high',
        message: 'High risk detected. Proceed with extreme caution or consider alternatives.',
        actions: ['Reassess travel necessity', 'Plan frequent check-ins', 'Carry emergency supplies']
      });
    }

    return recommendations;
  }

  /**
   * Get risk level string from score
   */
  getRiskLevel(score) {
    if (score < 25) return 'Low';
    if (score < 50) return 'Medium';
    if (score < 75) return 'High';
    return 'Critical';
  }

  /**
   * Calculate distance between two coordinates
   */
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

  estimateRouteDistance(coordinates) {
    if (!coordinates || coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += this.calculateDistance(
        coordinates[i-1].lat, coordinates[i-1].lng,
        coordinates[i].lat, coordinates[i].lng
      );
    }
    return totalDistance;
  }

  isUrbanRoute(routeData) {
    if (!routeData.coordinates) return false;
    
    const majorCities = [
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, radius: 25 },
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241, radius: 30 },
      { name: 'Durban', lat: -29.8587, lng: 31.0218, radius: 25 },
      { name: 'Pretoria', lat: -25.7479, lng: 28.2293, radius: 20 },
      { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, radius: 15 }
    ];

    for (const coord of routeData.coordinates) {
      for (const city of majorCities) {
        const distance = this.calculateDistance(coord.lat, coord.lng, city.lat, city.lng);
        if (distance <= city.radius) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get real-time alerts for immediate risks
   */
  async getRealTimeAlerts(vehicleData, currentLocation, weatherData) {
    const alerts = [];
    const riskAssessment = await this.calculateRiskScore(vehicleData, { coordinates: [currentLocation] }, weatherData);

    // Critical weather alerts
    if (weatherData) {
      if (weatherData.precipitation > 20) {
        alerts.push({
          type: 'weather',
          severity: 'critical',
          title: 'Heavy Rainfall Alert',
          message: 'Severe rainfall detected in your area. Extreme caution advised.',
          timestamp: new Date().toISOString()
        });
      }

      if (weatherData.wind_speed > 60) {
        alerts.push({
          type: 'weather',
          severity: 'critical',
          title: 'Extreme Wind Alert',
          message: 'Dangerous wind speeds detected. Avoid travel if possible.',
          timestamp: new Date().toISOString()
        });
      }

      if (weatherData.visibility < 1) {
        alerts.push({
          type: 'weather',
          severity: 'critical',
          title: 'Zero Visibility Alert',
          message: 'Extremely poor visibility. Pull over safely immediately.',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Location-based alerts
    const nearbyHotspots = this.saHotspots.filter(hotspot => {
      const distance = this.calculateDistance(
        currentLocation.lat, currentLocation.lng,
        hotspot.lat, hotspot.lng
      );
      return distance <= 2;
    });

    nearbyHotspots.forEach(hotspot => {
      if (hotspot.riskLevel > 75) {
        alerts.push({
          type: 'security',
          severity: 'high',
          title: 'High Crime Area Alert',
          message: `You are near ${hotspot.name}, a high-crime area. Exercise extreme caution.`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Time-based alerts
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 4) {
      alerts.push({
        type: 'timing',
        severity: 'medium',
        title: 'High-Risk Hours',
        message: 'Traveling during peak crime hours. Stay vigilant and avoid isolated areas.',
        timestamp: new Date().toISOString()
      });
    }

    return {
      alerts,
      overallRiskScore: riskAssessment.overallRiskScore,
      riskLevel: riskAssessment.riskLevel
    };
  }

  /**
   * Calculate insurance claim likelihood
   */
  calculateClaimProbability(vehicleData, riskFactors) {
    let probability = 0.05; // Base 5% probability

    const totalRiskScore = Object.values(riskFactors).reduce((sum, factor) => sum + (factor.score || 0), 0);
    
    const riskMultiplier = 1 + (totalRiskScore / 200);
    probability *= riskMultiplier;

    if (vehicleData.year && new Date().getFullYear() - vehicleData.year > 10) {
      probability *= 1.3;
    }

    if (vehicleData.main_driver_age < 25) {
      probability *= 1.8;
    } else if (vehicleData.main_driver_age > 65) {
      probability *= 1.2;
    }

    return Math.min(0.95, probability);
  }
}

export default RiskCalculator;