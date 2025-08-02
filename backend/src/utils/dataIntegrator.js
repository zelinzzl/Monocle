import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataIntegrator {
  constructor() {
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'demo_key';
    
    // Cache settings - updated path
    this.cacheDir = path.join(__dirname, 'ml', 'cache');
    this.cacheTTL = 10 * 60 * 1000; // 10 minutes
    
    this.initializeCache();
  }

  async initializeCache() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create cache directory:', error.message);
    }
  }

  /**
   * Get comprehensive weather data for coordinates
   */
  async getWeatherData(lat, lng, includeAlerts = true) {
    try {
      const cacheKey = `weather_${lat}_${lng}`;
      const cached = await this.getFromCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      // OpenWeatherMap API call
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.weatherApiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${this.weatherApiKey}&units=metric`;
      
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(currentWeatherUrl),
        axios.get(forecastUrl).catch(() => null) // Forecast is optional
      ]);

      const current = currentResponse.data;
      const forecast = forecastResponse?.data;

      // Process current weather
      const weatherData = {
        location: {
          lat,
          lng,
          name: current.name,
          country: current.sys.country
        },
        current: {
          temperature: current.main.temp,
          feels_like: current.main.feels_like,
          humidity: current.main.humidity,
          pressure: current.main.pressure,
          precipitation: this.calculatePrecipitation(current),
          wind_speed: current.wind.speed * 3.6, // Convert m/s to km/h
          wind_direction: current.wind.deg,
          visibility: (current.visibility || 10000) / 1000, // Convert to km
          weather_condition: current.weather[0].main,
          weather_description: current.weather[0].description,
          cloudiness: current.clouds.all,
          uv_index: 0 // Would need separate API call
        },
        forecast: [],
        alerts: [],
        timestamp: new Date().toISOString()
      };

      // Process forecast data
      if (forecast && forecast.list) {
        weatherData.forecast = forecast.list.slice(0, 8).map(item => ({
          datetime: item.dt_txt,
          temperature: item.main.temp,
          precipitation: this.calculatePrecipitation(item),
          wind_speed: item.wind.speed * 3.6,
          weather_condition: item.weather[0].main,
          risk_score: this.calculateWeatherRiskScore(item)
        }));
      }

      // Generate weather alerts
      if (includeAlerts) {
        weatherData.alerts = this.generateWeatherAlerts(weatherData.current);
      }

      // Cache the result
      await this.saveToCache(cacheKey, weatherData, this.cacheTTL);
      
      return weatherData;

    } catch (error) {
      console.error('Weather API error:', error.message);
      
      // Return fallback data
      return this.getFallbackWeatherData(lat, lng);
    }
  }

  /**
   * Get weather data for multiple points along a route
   */
  async getRouteWeatherData(coordinates) {
    try {
      // Sample points along route (max 10 to avoid API limits)
      const samplePoints = this.sampleRoutePoints(coordinates, 10);
      
      const weatherPromises = samplePoints.map(point => 
        this.getWeatherData(point.lat, point.lng, false)
      );

      const weatherDataArray = await Promise.all(weatherPromises);
      
      // Aggregate weather conditions
      const aggregatedWeather = this.aggregateRouteWeather(weatherDataArray);
      
      return {
        route_weather: aggregatedWeather,
        point_weather: weatherDataArray,
        risk_assessment: this.assessRouteWeatherRisk(weatherDataArray)
      };

    } catch (error) {
      console.error('Route weather error:', error.message);
      throw new Error('Failed to get route weather data');
    }
  }

  /**
   * Get South African crime data for location
   */
  async getCrimeData(lat, lng, radiusKm = 5) {
    try {
      // Load local crime data (would normally be from SAPS API or database)
      const crimeData = await this.loadCrimeHotspots();
      
      // Find nearby crime incidents
      const nearbyCrime = crimeData.filter(incident => {
        const distance = this.calculateDistance(lat, lng, incident.lat, incident.lng);
        return distance <= radiusKm;
      });

      // Calculate area risk score
      const riskScore = this.calculateAreaCrimeRisk(nearbyCrime, radiusKm);

      return {
        area_risk_score: riskScore,
        nearby_incidents: nearbyCrime.slice(0, 10), // Limit to 10 most recent
        risk_factors: this.identifyCrimeRiskFactors(nearbyCrime),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Crime data error:', error.message);
      return this.getFallbackCrimeData();
    }
  }

  /**
   * Get comprehensive route analysis
   */
  async getRouteAnalysis(startCoords, endCoords, waypoints = []) {
    try {
      const allPoints = [startCoords, ...waypoints, endCoords];
      
      // Get route weather
      const routeWeather = await this.getRouteWeatherData(allPoints);
      
      // Get crime data for key points
      const crimePromises = [startCoords, endCoords].map(coords =>
        this.getCrimeData(coords.lat, coords.lng)
      );
      const crimeData = await Promise.all(crimePromises);

      // Calculate route characteristics
      const routeStats = this.calculateRouteStatistics(allPoints);

      return {
        route: {
          distance: routeStats.distance,
          estimated_duration: routeStats.duration,
          route_type: routeStats.type,
          coordinates: allPoints
        },
        weather: routeWeather,
        security: {
          start_area: crimeData[0],
          end_area: crimeData[1],
          overall_security_score: this.calculateOverallSecurityScore(crimeData)
        },
        risk_summary: this.generateRouteTriskSummary(routeWeather, crimeData, routeStats),
        recommendations: this.generateRouteRecommendations(routeWeather, crimeData, routeStats)
      };

    } catch (error) {
      console.error('Route analysis error:', error.message);
      throw new Error('Failed to analyze route');
    }
  }

  /**
   * Load South African crime hotspots data
   */
  async loadCrimeHotspots() {
    try {
      const filePath = path.join(this.cacheDir, 'crimeHotspots.json');
      
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch {
        // Create default data if file doesn't exist
        const defaultData = this.generateDefaultCrimeData();
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
      }
    } catch (error) {
      console.error('Error loading crime data:', error.message);
      return this.generateDefaultCrimeData();
    }
  }

  /**
   * Generate default South African crime data
   */
  generateDefaultCrimeData() {
    return [
      // Johannesburg hotspots
      { id: 1, lat: -26.2041, lng: 28.0473, type: 'theft', severity: 'high', area: 'Johannesburg CBD', incidents_per_month: 150 },
      { id: 2, lat: -26.1849, lng: 28.0488, type: 'hijacking', severity: 'critical', area: 'Hillbrow', incidents_per_month: 45 },
      { id: 3, lat: -26.1009, lng: 28.0963, type: 'theft', severity: 'high', area: 'Alexandra', incidents_per_month: 120 },
      { id: 4, lat: -26.2678, lng: 27.8546, type: 'theft', severity: 'medium', area: 'Soweto', incidents_per_month: 80 },
      
      // Cape Town hotspots
      { id: 5, lat: -33.9249, lng: 18.4241, type: 'theft', severity: 'medium', area: 'Cape Town CBD', incidents_per_month: 90 },
      { id: 6, lat: -34.0299, lng: 18.6248, type: 'hijacking', severity: 'high', area: 'Cape Flats', incidents_per_month: 110 },
      { id: 7, lat: -34.0364, lng: 18.6248, type: 'theft', severity: 'high', area: 'Mitchells Plain', incidents_per_month: 95 },
      
      // Durban hotspots
      { id: 8, lat: -29.8587, lng: 31.0218, type: 'theft', severity: 'medium', area: 'Durban Central', incidents_per_month: 70 },
      { id: 9, lat: -29.9729, lng: 30.8827, type: 'hijacking', severity: 'high', area: 'Umlazi', incidents_per_month: 85 },
      
      // Pretoria hotspots
      { id: 10, lat: -25.7479, lng: 28.2293, type: 'theft', severity: 'medium', area: 'Pretoria CBD', incidents_per_month: 60 }
    ];
  }

  /**
   * Calculate precipitation from weather data
   */
  calculatePrecipitation(weatherData) {
    const rain = weatherData.rain?.['1h'] || weatherData.rain?.['3h'] || 0;
    const snow = weatherData.snow?.['1h'] || weatherData.snow?.['3h'] || 0;
    return rain + snow;
  }

  /**
   * Calculate weather risk score
   */
  calculateWeatherRiskScore(weatherData) {
    let risk = 0;
    
    const precipitation = this.calculatePrecipitation(weatherData);
    const windSpeed = weatherData.wind.speed * 3.6; // Convert to km/h
    const visibility = (weatherData.visibility || 10000) / 1000;

    // Precipitation risk
    if (precipitation > 20) risk += 40;
    else if (precipitation > 10) risk += 25;
    else if (precipitation > 2) risk += 10;

    // Wind risk
    if (windSpeed > 60) risk += 35;
    else if (windSpeed > 40) risk += 20;
    else if (windSpeed > 25) risk += 10;

    // Visibility risk
    if (visibility < 1) risk += 45;
    else if (visibility < 3) risk += 25;
    else if (visibility < 5) risk += 15;

    return Math.min(100, risk);
  }

  /**
   * Generate weather alerts
   */
  generateWeatherAlerts(currentWeather) {
    const alerts = [];

    if (currentWeather.precipitation > 20) {
      alerts.push({
        type: 'precipitation',
        severity: 'severe',
        message: 'Heavy rainfall detected. Exercise extreme caution.',
        recommendation: 'Consider postponing travel or finding shelter.'
      });
    }

    if (currentWeather.wind_speed > 60) {
      alerts.push({
        type: 'wind',
        severity: 'severe',
        message: 'Dangerous wind speeds detected.',
        recommendation: 'Avoid travel, especially in high-profile vehicles.'
      });
    }

    if (currentWeather.visibility < 1) {
      alerts.push({
        type: 'visibility',
        severity: 'critical',
        message: 'Extremely poor visibility conditions.',
        recommendation: 'Pull over safely and wait for conditions to improve.'
      });
    }

    return alerts;
  }

  /**
   * Sample points along a route
   */
  sampleRoutePoints(coordinates, maxPoints) {
    if (coordinates.length <= maxPoints) {
      return coordinates;
    }

    const step = Math.floor(coordinates.length / maxPoints);
    const sampledPoints = [];

    for (let i = 0; i < coordinates.length; i += step) {
      sampledPoints.push(coordinates[i]);
    }

    // Always include the last point
    if (sampledPoints[sampledPoints.length - 1] !== coordinates[coordinates.length - 1]) {
      sampledPoints.push(coordinates[coordinates.length - 1]);
    }

    return sampledPoints;
  }

  /**
   * Aggregate weather data for route
   */
  aggregateRouteWeather(weatherDataArray) {
    if (!weatherDataArray.length) return null;

    const aggregated = {
      max_temperature: Math.max(...weatherDataArray.map(w => w.current.temperature)),
      min_temperature: Math.min(...weatherDataArray.map(w => w.current.temperature)),
      max_precipitation: Math.max(...weatherDataArray.map(w => w.current.precipitation)),
      max_wind_speed: Math.max(...weatherDataArray.map(w => w.current.wind_speed)),
      min_visibility: Math.min(...weatherDataArray.map(w => w.current.visibility)),
      dominant_condition: this.getMostFrequentCondition(weatherDataArray),
      average_risk_score: weatherDataArray.reduce((sum, w) => 
        sum + this.calculateWeatherRiskScore(w.current), 0) / weatherDataArray.length
    };

    return aggregated;
  }

  /**
   * Get most frequent weather condition
   */
  getMostFrequentCondition(weatherDataArray) {
    const conditions = weatherDataArray.map(w => w.current.weather_condition);
    const frequency = {};
    
    conditions.forEach(condition => {
      frequency[condition] = (frequency[condition] || 0) + 1;
    });

    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  /**
   * Assess route weather risk
   */
  assessRouteWeatherRisk(weatherDataArray) {
    const maxRisk = Math.max(...weatherDataArray.map(w => 
      this.calculateWeatherRiskScore(w.current)
    ));

    const averageRisk = weatherDataArray.reduce((sum, w) => 
      sum + this.calculateWeatherRiskScore(w.current), 0) / weatherDataArray.length;

    return {
      max_risk_score: maxRisk,
      average_risk_score: averageRisk,
      risk_level: maxRisk > 70 ? 'Critical' : maxRisk > 50 ? 'High' : maxRisk > 25 ? 'Medium' : 'Low',
      high_risk_segments: weatherDataArray
        .map((w, index) => ({ index, risk: this.calculateWeatherRiskScore(w.current) }))
        .filter(segment => segment.risk > 50)
        .map(segment => segment.index)
    };
  }

  /**
   * Calculate area crime risk
   */
  calculateAreaCrimeRisk(crimeIncidents, radiusKm) {
    if (!crimeIncidents.length) return 10; // Base risk

    const totalIncidents = crimeIncidents.reduce((sum, incident) => 
      sum + (incident.incidents_per_month || 1), 0
    );

    const area = Math.PI * radiusKm * radiusKm; // km²
    const incidentDensity = totalIncidents / area;

    // Normalize to 0-100 scale
    let riskScore = Math.min(100, incidentDensity * 10);

    // Adjust for severity
    const hasHighSeverity = crimeIncidents.some(incident => 
      incident.severity === 'critical' || incident.severity === 'high'
    );

    if (hasHighSeverity) {
      riskScore *= 1.5;
    }

    return Math.min(100, Math.round(riskScore));
  }

  /**
   * Identify crime risk factors
   */
  identifyCrimeRiskFactors(crimeIncidents) {
    const factors = [];
    
    const crimeTypes = [...new Set(crimeIncidents.map(i => i.type))];
    const severityLevels = [...new Set(crimeIncidents.map(i => i.severity))];

    if (crimeTypes.includes('hijacking')) {
      factors.push('Vehicle hijacking incidents reported');
    }
    
    if (crimeTypes.includes('theft')) {
      factors.push('Vehicle theft incidents reported');
    }

    if (severityLevels.includes('critical')) {
      factors.push('Critical severity incidents in area');
    }

    const recentIncidents = crimeIncidents.filter(i => 
      i.incidents_per_month > 50
    ).length;

    if (recentIncidents > 2) {
      factors.push('High frequency crime area');
    }

    return factors;
  }

  /**
   * Calculate distance between coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
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

  /**
   * Calculate route statistics
   */
  calculateRouteStatistics(coordinates) {
    let totalDistance = 0;
    
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += this.calculateDistance(
        coordinates[i-1].lat, coordinates[i-1].lng,
        coordinates[i].lat, coordinates[i].lng
      );
    }

    const estimatedDuration = totalDistance * 1.2; // Rough estimate: 50 km/h average
    const routeType = totalDistance > 100 ? 'long_distance' : totalDistance > 30 ? 'medium_distance' : 'short_distance';

    return {
      distance: totalDistance,
      duration: estimatedDuration,
      type: routeType
    };
  }

  /**
   * Cache management
   */
  async getFromCache(key) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      const stats = await fs.stat(cacheFile);
      
      if (Date.now() - stats.mtime.getTime() < this.cacheTTL) {
        const data = await fs.readFile(cacheFile, 'utf8');
        return JSON.parse(data);
      }
    } catch {
      // Cache miss or error
    }
    return null;
  }

  async saveToCache(key, data, ttl = this.cacheTTL) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      await fs.writeFile(cacheFile, JSON.stringify(data));
    } catch (error) {
      console.warn('Cache save failed:', error.message);
    }
  }

  /**
   * Get fallback weather data when API fails
   */
  getFallbackWeatherData(lat, lng) {
    return {
      location: { lat, lng, name: 'Unknown', country: 'ZA' },
      current: {
        temperature: 20,
        feels_like: 20,
        humidity: 60,
        pressure: 1013,
        precipitation: 0,
        wind_speed: 10,
        wind_direction: 180,
        visibility: 10,
        weather_condition: 'Clear',
        weather_description: 'clear sky',
        cloudiness: 20,
        uv_index: 5
      },
      forecast: [],
      alerts: [],
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Get fallback crime data
   */
  getFallbackCrimeData() {
    return {
      area_risk_score: 30,
      nearby_incidents: [],
      risk_factors: ['Limited crime data available'],
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Calculate overall security score
   */
  calculateOverallSecurityScore(crimeDataArray) {
    if (!crimeDataArray.length) return 50;
    
    const averageRisk = crimeDataArray.reduce((sum, data) => 
      sum + data.area_risk_score, 0) / crimeDataArray.length;
    
    return Math.round(100 - averageRisk); // Invert so higher = safer
  }

  /**
   * Generate route risk summary
   */
  generateRouteRiskSummary(routeWeather, crimeData, routeStats) {
    const weatherRisk = routeWeather.risk_assessment.max_risk_score;
    const securityRisk = Math.max(...crimeData.map(d => d.area_risk_score));
    
    let overallRisk = (weatherRisk * 0.6) + (securityRisk * 0.4);
    
    // Adjust for route length
    if (routeStats.type === 'long_distance') {
      overallRisk += 10;
    } else if (routeStats.type === 'medium_distance') {
      overallRisk += 5;
    }

    overallRisk = Math.min(100, overallRisk);

    return {
      overall_risk_score: Math.round(overallRisk),
      risk_level: overallRisk > 70 ? 'Critical' : overallRisk > 50 ? 'High' : overallRisk > 25 ? 'Medium' : 'Low',
      primary_risk_factors: this.identifyPrimaryRiskFactors(weatherRisk, securityRisk, routeStats),
      weather_contribution: Math.round(weatherRisk * 0.6),
      security_contribution: Math.round(securityRisk * 0.4),
      distance_factor: routeStats.type
    };
  }

  /**
   * Identify primary risk factors
   */
  identifyPrimaryRiskFactors(weatherRisk, securityRisk, routeStats) {
    const factors = [];

    if (weatherRisk > 50) {
      factors.push('adverse_weather');
    }
    
    if (securityRisk > 60) {
      factors.push('high_crime_area');
    }
    
    if (routeStats.type === 'long_distance') {
      factors.push('long_distance_travel');
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour <= 4) {
      factors.push('high_risk_hours');
    }

    return factors;
  }

  /**
   * Generate route recommendations
   */
  generateRouteRecommendations(routeWeather, crimeData, routeStats) {
    const recommendations = [];

    // Weather-based recommendations
    const maxWeatherRisk = routeWeather.risk_assessment.max_risk_score;
    if (maxWeatherRisk > 70) {
      recommendations.push({
        type: 'weather',
        priority: 'critical',
        message: 'Severe weather conditions expected along route',
        action: 'Consider postponing travel or alternative route'
      });
    } else if (maxWeatherRisk > 40) {
      recommendations.push({
        type: 'weather',
        priority: 'high',
        message: 'Challenging weather conditions ahead',
        action: 'Reduce speed and increase following distance'
      });
    }

    // Security-based recommendations
    const maxSecurityRisk = Math.max(...crimeData.map(d => d.area_risk_score));
    if (maxSecurityRisk > 70) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'Route passes through high-crime areas',
        action: 'Avoid stops, keep doors locked, consider alternative route'
      });
    }

    // Distance-based recommendations
    if (routeStats.type === 'long_distance') {
      recommendations.push({
        type: 'preparation',
        priority: 'medium',
        message: 'Long distance journey planned',
        action: 'Ensure vehicle maintenance, plan rest stops, carry emergency supplies'
      });
    }

    // Time-based recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 20 || currentHour <= 5) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        message: 'Traveling during higher-risk hours',
        action: 'Stay alert, avoid isolated areas, inform contacts of route'
      });
    }

    return recommendations;
  }
}

export default DataIntegrator;