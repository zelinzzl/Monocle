// services/RouteRiskService.js
import { supabase } from "../config/database.js";
import fetch from "node-fetch";

class RouteRiskService {
  static weatherCache = new Map();
  static cacheTimeout = 1000 * 60 * 30; // 30 minutes
  static weatherApiKey = process.env.GOOGLE_WEATHER_API_KEY;
  static directionsApiKey = process.env.GOOGLE_DIRECTIONS_API_KEY;

  static async calculateRouteRisk(routeId, departureTime = new Date()) {
    try {
      const cachedRisk = await this.getCachedRisk(routeId);
      if (cachedRisk && new Date(cachedRisk.valid_until) > new Date()) {
        return cachedRisk;
      }

      const route = await this.getRouteFromDB(routeId);
      if (!route) throw new Error(`Route ${routeId} not found`);

      const segments = await this.getRouteSegments(
        route.coordinates.source,
        route.coordinates.destination
      );

      const weatherData = await this.getRouteWeatherForecast(
        segments,
        departureTime
      );

      const riskScore = this.computeRiskScore(route, weatherData, departureTime);

      const result = {
        route_id: routeId,
        risk_score: riskScore.overall_risk,
        risk_level: riskScore.risk_level,
        risk_factors: riskScore.risk_factors,
        weather_factors: weatherData,
        calculated_at: new Date(),
        valid_until: new Date(Date.now() + 6 * 60 * 60 * 1000),
      };

      await this.cacheRiskCalculation(result);
      return result;
    } catch (error) {
      console.error("Error calculating route risk:", error);
      throw new Error(`Failed to calculate route risk: ${error.message}`);
    }
  }

  static async getRouteFromDB(routeId) {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  static async getCachedRisk(routeId) {
    const { data, error } = await supabase
      .from("route_risk_cache")
      .select("*")
      .eq("route_id", routeId)
      .gte("valid_until", new Date().toISOString())
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Cache lookup error:", error);
    }

    return data;
  }

  static async getRouteSegments(source, destination) {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${source.lat},${source.lng}&destination=${destination.lat},${destination.lng}&key=${this.directionsApiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch directions");

    const data = await response.json();
    if (data.status !== "OK")
      throw new Error(`Directions API error: ${data.status}`);

    const steps = data.routes[0].legs[0].steps;

    return steps.map((step, index) => ({
      lat: step.end_location.lat,
      lon: step.end_location.lng,
      index,
      type: "segment",
      distance_m: step.distance.value,
      duration_s: step.duration.value,
      instruction: step.html_instructions,
    }));
  }

  static async getRouteWeatherForecast(segments, departureTime) {
    const weatherForecasts = [];

    for (const segment of segments) {
      try {
        const forecast = await this.fetchWeatherForCoordinates(
          segment.lat,
          segment.lon,
          departureTime
        );

        const extractedData = this.extractRiskDataFromForecast(
          forecast.forecastHours?.[0]
        );

        weatherForecasts.push({
          segment,
          forecast: extractedData,
          segment_index: segment.index,
        });
      } catch (error) {
        console.error(
          `Weather fetch failed for segment ${segment.index}:`,
          error
        );
        weatherForecasts.push({
          segment,
          forecast: this.getFallbackWeatherData(),
          segment_index: segment.index,
          is_fallback: true,
        });
      }
    }

    return weatherForecasts;
  }

  static async fetchWeatherForCoordinates(lat, lon, startTime) {
    // 🚨 TEMPORARY MOCK FOR TESTING
    if (process.env.MOCK_BAD_WEATHER === "true") {
       return {
      forecastHours: [{
        thunderstormProbability: 80,
        weatherCondition: { type: "THUNDERSTORM" },
        precipitation: { probability: { percent: 90 } },
      }],
    };
    }
    const cacheKey = `${lat},${lon},${startTime.toDateString()}`;
    if (this.weatherCache.has(cacheKey)) {
      const cached = this.weatherCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const url = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${this.weatherApiKey}&location.latitude=${lat}&location.longitude=${lon}&hours=3`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Weather API error: ${response.status} ${response.statusText}`
      );
    }

    const weatherData = await response.json();

    this.weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    return weatherData;
  }

  static extractRiskDataFromForecast(forecastHour) {
    if (!forecastHour) {
      return this.getFallbackWeatherData();
    }

    return {
      thunderstormProbability: forecastHour.thunderstormProbability || 0,
      weatherType: forecastHour.weatherCondition?.type || "UNKNOWN",
      rainProbability:
        forecastHour.precipitation?.probability?.percent || 0,
    };
  }

  static computeRiskScore(route, weatherData, departureTime) {
  const riskFactors = {
    weather_risk: 0,
    route_complexity: 0,
    traffic_risk: 0,
    time_of_day_risk: 0,
  };

  let totalWeatherRisk = 0;
  const segmentDetails = [];

  weatherData.forEach((segmentWeather, idx) => {
    const { thunderstormProbability, weatherType, rainProbability } =
      segmentWeather.forecast;
    let segmentRisk = 0;

    if (thunderstormProbability > 50) segmentRisk += 40;
    else if (thunderstormProbability > 20) segmentRisk += 20;

    if (rainProbability > 50) segmentRisk += 25;
    else if (rainProbability > 20) segmentRisk += 10;

    const severeTypes = ["THUNDERSTORM", "RAIN", "SNOW", "HAIL"];
    if (severeTypes.includes(weatherType)) {
      segmentRisk += 30;
    }

    totalWeatherRisk += segmentRisk;

    segmentDetails.push({
      segment: idx,
      thunderstormProbability,
      weatherType,
      rainProbability,
      segmentRisk,
    });
  });

  riskFactors.weather_risk = Math.min(
    100,
    totalWeatherRisk / weatherData.length
  );

  const routeDistance = route.distance_km || 0;
  const mountainRoads = route.has_mountain_roads || false;
  const highwayPercentage = route.highway_percentage || 100;

  if (mountainRoads) riskFactors.route_complexity += 20;
  if (highwayPercentage < 50) riskFactors.route_complexity += 15;
  if (routeDistance > 500) riskFactors.route_complexity += 10;

  const departureHour = departureTime.getHours();
  if (departureHour >= 22 || departureHour <= 5)
    riskFactors.time_of_day_risk += 20;
  if (
    (departureHour >= 7 && departureHour <= 9) ||
    (departureHour >= 17 && departureHour <= 19)
  )
    riskFactors.traffic_risk += 15;

  // ✅ Weighted risk calculation
  const weightedOverallRisk =
    riskFactors.weather_risk * 0.6 +
    riskFactors.route_complexity * 0.1 +
    riskFactors.traffic_risk * 0.3 +
    riskFactors.time_of_day_risk * 0.3;

  return {
    overall_risk: Math.min(100, Math.round(weightedOverallRisk)),
    risk_factors: riskFactors,
    segment_details: segmentDetails, // ✅ for debugging
    risk_level: this.getRiskLevel(weightedOverallRisk),
  };
}

static getRiskLevel(score) {
  if (score >= 75) return "EXTREME";
  if (score >= 50) return "HIGH";
  if (score >= 20) return "MODERATE";
  return "LOW";
}

  static getFallbackWeatherData() {
    return {
      thunderstormProbability: 0,
      weatherType: "UNKNOWN",
      rainProbability: 0,
      is_fallback: true,
    };
  }

  static async cacheRiskCalculation(riskData) {
    try {
      const { error } = await supabase.from("route_risk_cache").insert({
        route_id: riskData.route_id,
        risk_score: riskData.risk_score,
        risk_factors: riskData.risk_factors,
        weather_data: riskData.weather_factors,
        calculated_at: riskData.calculated_at,
        valid_until: riskData.valid_until,
      });

      if (error) console.error("Failed to cache risk calculation:", error);
    } catch (error) {
      console.error("Cache operation failed:", error);
    }
  }

  static async cleanupExpiredCache() {
    const { error } = await supabase
      .from("route_risk_cache")
      .delete()
      .lt("valid_until", new Date().toISOString());

    if (error) console.error("Cache cleanup failed:", error);
  }

  static async compareRouteRisks(routeIds, departureTime) {
    const riskPromises = routeIds.map((routeId) =>
      this.calculateRouteRisk(routeId, departureTime).catch((error) => ({
        route_id: routeId,
        error: error.message,
        risk_score: null,
      }))
    );

    const results = await Promise.all(riskPromises);

    const sortedResults = results
      .filter((result) => result.risk_score !== null)
      .sort((a, b) => a.risk_score - b.risk_score);

    return {
      routes: results,
      recommended_route: sortedResults[0]?.route_id || null,
      comparison_time: new Date(),
    };
  }

  static async getRiskHistory(routeId, limit = 10) {
    const { data, error } = await supabase
      .from("route_risk_cache")
      .select("*")
      .eq("route_id", routeId)
      .order("calculated_at", { ascending: false })
      .limit(limit);

    if (error)
      throw new Error(`Failed to retrieve risk history: ${error.message}`);
    return data;
  }
}

export default RouteRiskService;
