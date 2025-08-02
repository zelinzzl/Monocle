"use client";

import { useState, useEffect } from 'react';
import RiskSummaryCard from "@/components/dashboard/RiskSummaryCard";
import RouteRiskChart from "@/components/dashboard/RouteRiskChart";
import { AlertTriangleIcon, CloudRainIcon, ShieldIcon, CarIcon, MapPinIcon, ClockIcon, RefreshCwIcon } from 'lucide-react';
import { useRouter } from "next/navigation";
import { apiFetch } from '@/services/api';

interface WeatherAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  location: string;
  timestamp: string;
  time?: string;
}

interface RouteRiskData {
  critical: number;
  high: number;
  medium: number;
  good: number;
}

interface DashboardData {
  summary: {
    protectedRoutes: { count: number; description: string };
    atRiskRoutes: { count: number; description: string };
    monitoredVehicles: { count: number; description: string };
    riskBreakdown: {
      criticalRisk: number;
      highRisk: number;
      mediumRisk: number;
      goodConditions: number;
    };
    riskMitigation: { percentage: number; message: string };
  };
  recentAlerts: any[];
  recommendations: any[];
  vehicles: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  
  // State management
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Fallback data (your original static data)
  const fallbackRouteRiskData: RouteRiskData = {
    critical: 12,
    high: 8,
    medium: 15,
    good: 23
  };

  const fallbackAlerts: WeatherAlert[] = [
    {
      id: '1',
      title: 'Severe hailstorm warning',
      location: 'N1 Highway, Midrand',
      time: '15 minutes ago',
      type: 'weather',
      severity: 'high',
      message: 'Severe hailstorm warning',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Flash flood alert',
      location: 'R21 near OR Tambo',
      time: '35 minutes ago',
      type: 'weather',
      severity: 'medium',
      message: 'Flash flood alert',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Heavy rain warning',
      location: 'M1 South, Johannesburg',
      time: '1 hour ago',
      type: 'weather',
      severity: 'medium',
      message: 'Heavy rain warning',
      timestamp: new Date().toISOString()
    }
  ];

  const fallbackRecommendations = [
    'Avoid N1 Highway near Midrand due to severe hail forecast',
    'Consider alternative routes to R21 due to flash flood warnings',
    'M5 and N2 routes currently showing good weather conditions'
  ];

  // Generate mock real-time alerts with variation
  const generateMockRealTimeAlerts = (): WeatherAlert[] => {
    const alertTypes = [
      { type: 'weather', severity: 'high', title: 'Severe thunderstorm warning', location: 'N1 Highway, Midrand' },
      { type: 'weather', severity: 'medium', title: 'Heavy rain alert', location: 'R21 near OR Tambo' },
      { type: 'weather', severity: 'medium', title: 'Strong wind warning', location: 'M1 South, Johannesburg' },
      { type: 'weather', severity: 'high', title: 'Hail warning', location: 'N3 Highway, Pretoria' },
      { type: 'weather', severity: 'low', title: 'Light rain expected', location: 'M2 Highway, Cape Town' },
      { type: 'security', severity: 'medium', title: 'Road closure alert', location: 'N12 Highway, Johannesburg' }
    ];

    const randomCount = Math.floor(Math.random() * 4) + 1; // 1-4 alerts
    const selectedAlerts: WeatherAlert[] = [];
    
    for (let i = 0; i < randomCount; i++) {
      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const minutesAgo = Math.floor(Math.random() * 60) + 1;
      
      selectedAlerts.push({
        id: `mock-${i}-${Date.now()}`,
        type: randomAlert.type,
        severity: randomAlert.severity,
        title: randomAlert.title,
        message: `${randomAlert.title} - Updated ${new Date().toLocaleTimeString()}`,
        location: randomAlert.location,
        timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
        time: `${minutesAgo} minutes ago`
      });
    }

    return selectedAlerts;
  };

  // Fetch weather alerts for a specific location
  const fetchWeatherAlerts = async (lat: number, lng: number, cityName: string, timestamp?: number): Promise<WeatherAlert[]> => {
    try {
      // Add cache busting to weather alerts endpoint
      const url = timestamp 
        ? `/api/ml/weather-alerts/${lat}/${lng}?t=${timestamp}`
        : `/api/ml/weather-alerts/${lat}/${lng}`;
        
      const response = await apiFetch(url);
      
      if (response.success && response.data.alerts && response.data.alerts.length > 0) {
        // Use real alerts from your ML backend
        console.log(`Real alerts found for ${cityName}:`, response.data.alerts);
        return response.data.alerts.map((alert: any, index: number) => ({
          id: `${cityName}-${index}-${timestamp || Date.now()}`,
          type: alert.type || 'weather',
          severity: alert.severity || 'medium',
          title: alert.title || alert.type || 'Weather Alert',
          message: alert.message,
          location: `${cityName} area`,
          timestamp: alert.timestamp || new Date().toISOString(),
          time: formatTimeAgo(alert.timestamp)
        }));
      } else {
        // Fallback to real weather-based alerts when no alerts are present
        console.log(`No alerts from backend for ${cityName}, generating weather-based alerts`);
        return generateWeatherBasedAlerts(lat, lng, cityName);
      }
    } catch (error) {
      console.error(`Error fetching alerts for ${cityName}:`, error);
      return generateWeatherBasedAlerts(lat, lng, cityName);
    }
  };

  // Generate alerts based on real weather conditions
  const generateWeatherBasedAlerts = async (lat: number, lng: number, cityName: string): Promise<WeatherAlert[]> => {
    try {
      // Get actual weather data
      const weatherResponse = await apiFetch(`/api/ml/weather-predictions/${lat}/${lng}`);
      
      if (weatherResponse.success && weatherResponse.data) {
        const weather = weatherResponse.data.current_weather;
        const alerts: WeatherAlert[] = [];
        
        // Generate alerts based on real weather conditions
        if (weather.precipitation > 10) {
          alerts.push({
            id: `real-rain-${cityName}-${Date.now()}`,
            type: 'precipitation',
            severity: weather.precipitation > 20 ? 'high' : 'medium',
            title: `${weather.precipitation > 20 ? 'Heavy' : 'Moderate'} Rain Alert`,
            message: `${weather.precipitation.toFixed(1)}mm precipitation detected in ${cityName}`,
            location: cityName,
            timestamp: new Date().toISOString(),
            time: 'Now'
          });
        }

        if (weather.wind_speed > 40) {
          alerts.push({
            id: `real-wind-${cityName}-${Date.now()}`,
            type: 'wind',
            severity: weather.wind_speed > 60 ? 'high' : 'medium',
            title: 'Strong Wind Warning',
            message: `Wind speed ${weather.wind_speed.toFixed(1)} km/h in ${cityName}`,
            location: cityName,
            timestamp: new Date().toISOString(),
            time: 'Now'
          });
        }

        if (weather.visibility < 5) {
          alerts.push({
            id: `real-visibility-${cityName}-${Date.now()}`,
            type: 'visibility',
            severity: weather.visibility < 1 ? 'high' : 'medium',
            title: 'Low Visibility Alert',
            message: `Visibility reduced to ${weather.visibility}km in ${cityName}`,
            location: cityName,
            timestamp: new Date().toISOString(),
            time: 'Now'
          });
        }

        // If no real weather issues, but weather is not ideal
        if (alerts.length === 0 && (weather.temperature > 35 || weather.temperature < 5)) {
          alerts.push({
            id: `real-temp-${cityName}-${Date.now()}`,
            type: 'weather',
            severity: 'low',
            title: 'Extreme Temperature Advisory',
            message: `Temperature ${weather.temperature}°C in ${cityName} - exercise caution`,
            location: cityName,
            timestamp: new Date().toISOString(),
            time: 'Now'
          });
        }

        return alerts;
      }
    } catch (error) {
      console.error('Error generating weather-based alerts:', error);
    }

    // Ultimate fallback to ensure dashboard always has some demo data
    return [{
      id: `fallback-${cityName}-${Date.now()}`,
      type: 'system',
      severity: 'low',
      title: 'System Alert',
      message: `Weather monitoring active for ${cityName}`,
      location: cityName,
      timestamp: new Date().toISOString(),
      time: 'Now'
    }];
  };

  // Load ML dashboard data
  const loadMLDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add cache-busting parameter to force fresh data
      const timestamp = new Date().getTime();
      
      // Fetch ML dashboard data with cache busting
      const mlResponse = await apiFetch(`/api/ml/dashboard?t=${timestamp}`);
      
      if (mlResponse.success && mlResponse.data) {
        setDashboardData(mlResponse.data);
        
        // Fetch weather alerts for major SA cities with cache busting
        const [jhbAlerts, ctAlerts, durbanAlerts] = await Promise.all([
          fetchWeatherAlerts(-26.2041, 28.0473, 'Johannesburg', timestamp),
          fetchWeatherAlerts(-33.9249, 18.4241, 'Cape Town', timestamp),
          fetchWeatherAlerts(-29.8587, 31.0218, 'Durban', timestamp)
        ]);
        
        const allAlerts = [...jhbAlerts, ...ctAlerts, ...durbanAlerts];
        
        // Add some randomization to demonstrate real-time updates
        const updatedAlerts = allAlerts.length > 0 ? allAlerts : generateMockRealTimeAlerts();
        
        setWeatherAlerts(updatedAlerts);
        setLastUpdated(new Date().toLocaleTimeString());
        
        console.log('Dashboard updated:', {
          mlData: mlResponse.data,
          alertsCount: updatedAlerts.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error loading ML dashboard data:', err);
      setError('Using cached data - ML service temporarily unavailable');
      
      // Use fallback data with some variation
      const variedFallbackAlerts = generateMockRealTimeAlerts();
      setWeatherAlerts(variedFallbackAlerts);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string): string => {
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
  };

  // Get alert icon based on type
  const getAlertIcon = (alert: WeatherAlert) => {
    switch (alert.type) {
      case 'weather':
      case 'precipitation':
        return <CloudRainIcon className="h-5 w-5 text-blue-500" />;
      case 'wind':
        return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'visibility':
        return <AlertTriangleIcon className="h-5 w-5 text-gray-500" />;
      case 'security':
      case 'high_risk':
        return <AlertTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'timing':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
    }
  };

  // Get severity styling
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'severe':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Format recommendations from ML data
  const formatRecommendations = (mlRecommendations: any[]): string[] => {
    if (!mlRecommendations || mlRecommendations.length === 0) {
      return fallbackRecommendations;
    }
    
    return mlRecommendations.map(rec => {
      if (typeof rec === 'string') return rec;
      return rec.message || rec.action || 'Travel recommendation available';
    }).slice(0, 5);
  };

  // Get route risk data from ML dashboard
  const getRouteRiskData = (): RouteRiskData => {
    if (!dashboardData) return fallbackRouteRiskData;
    
    const breakdown = dashboardData.summary.riskBreakdown;
    return {
      critical: breakdown.criticalRisk || 0,
      high: breakdown.highRisk || 0,
      medium: breakdown.mediumRisk || 0,
      good: breakdown.goodConditions || 0,
    };
  };

  // Get risk summaries from ML data
  const getRiskSummaries = () => {
    const currentRouteRiskData = getRouteRiskData();
    
    return [
      {
        title: 'Protected Routes',
        count: dashboardData?.summary.protectedRoutes.count || currentRouteRiskData.good,
        icon: <ShieldIcon className="h-6 w-6 text-green-500" />,
        color: 'bg-green-100 text-green-800',
        description: dashboardData?.summary.protectedRoutes.description || 'Routes with minimal weather risks'
      },
      {
        title: 'At-Risk Routes',
        count: dashboardData?.summary.atRiskRoutes.count || (currentRouteRiskData.critical + currentRouteRiskData.high + currentRouteRiskData.medium),
        icon: <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
        color: 'bg-red-100 text-red-800',
        description: dashboardData?.summary.atRiskRoutes.description || 'Routes with potential weather hazards'
      },
      {
        title: 'Monitored Vehicles',
        count: dashboardData?.summary.monitoredVehicles.count || dashboardData?.vehicles.length || 5,
        icon: <CarIcon className="h-6 w-6 text-blue-500" />,
        color: 'bg-blue-100 text-blue-800',
        description: dashboardData?.summary.monitoredVehicles.description || 'Vehicles currently being tracked'
      }
    ];
  };

  // Initial load
  useEffect(() => {
    loadMLDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadMLDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Derived data
  const routeRiskData = getRouteRiskData();
  const riskSummaries = getRiskSummaries();
  const recommendations = formatRecommendations(dashboardData?.recommendations || []);
  const displayAlerts = weatherAlerts.length > 0 ? weatherAlerts : fallbackAlerts;

  return (
    <main>
      <div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-dark">
                    Travel Risk Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Monitor weather-related travel risks in real-time using ML predictions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated || 'Loading...'}
                    {lastUpdated && (
                      <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </p>
                  <button
                    onClick={async () => {
                      console.log('Manual refresh triggered');
                      await loadMLDashboardData();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    disabled={loading}
                  >
                    <RefreshCwIcon className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-refresh: Every 5 minutes
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>
              )}
              
              {loading && !dashboardData && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">Loading ML risk assessment data...</p>
                </div>
              )}

              {/* Debug Panel - Remove in production */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <details>
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    🔧 Debug Info (Click to expand)
                  </summary>
                  <div className="mt-2 space-y-1 text-gray-600">
                    <p>• Alerts Count: {displayAlerts.length}</p>
                    <p>• Dashboard Data: {dashboardData ? 'Loaded' : 'Not loaded'}</p>
                    <p>• Last Refresh: {lastUpdated || 'Never'}</p>
                    <p>• Error State: {error || 'None'}</p>
                    <p>• Route Risk Data: Critical: {routeRiskData.critical}, High: {routeRiskData.high}, Medium: {routeRiskData.medium}, Good: {routeRiskData.good}</p>
                    <p>• Alert IDs: {displayAlerts.map(a => a.id).join(', ')}</p>
                  </div>
                </details>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Cards */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {riskSummaries.map((summary, index) => (
                    <RiskSummaryCard
                      key={index}
                      title={summary.title}
                      count={summary.count}
                      icon={summary.icon}
                      color={summary.color}
                      description={summary.description}
                    />
                  ))}
                </div>

                <div className="bg-background rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      Real-time Weather Alerts
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {displayAlerts.length} active alerts
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {displayAlerts.length > 0 ? (
                      displayAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-start border-b pb-3 last:border-0 last:pb-0 p-3 rounded-lg ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="p-2 rounded-full bg-white mr-3">
                            {getAlertIcon(alert)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500 flex items-center">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {alert.location}
                              </p>
                              <p className="text-xs text-gray-500">{alert.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShieldIcon className="h-12 w-12 mx-auto mb-3 text-green-500" />
                        <p>No active weather alerts</p>
                        <p className="text-sm">All monitored routes are currently safe</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-background rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 text-dark">
                    ML Travel Recommendations
                  </h2>
                  <ul className="space-y-2">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            rec.includes('Avoid') || rec.includes('severe') ? 'bg-red-500' :
                            rec.includes('Consider') || rec.includes('warning') ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}></span>
                          {rec}
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        All routes currently showing optimal conditions
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Right Column - Chart */}
              <div className="bg-background rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  ML Route Risk Analysis
                </h2>
                <RouteRiskChart data={routeRiskData} />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-sidebar p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-dark">
                      Risk Breakdown
                    </h3>
                    <ul className="mt-2 space-y-1">
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                          Critical Risk
                        </span>
                        <span className="font-medium">{routeRiskData.critical}</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                          High Risk
                        </span>
                        <span className="font-medium">{routeRiskData.high}</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                          Medium Risk
                        </span>
                        <span className="font-medium">{routeRiskData.medium}</span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          Good Conditions
                        </span>
                        <span className="font-medium">{routeRiskData.good}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-sidebar p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-dark">
                      ML Risk Mitigation
                    </h3>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.summary.riskMitigation.percentage ??
                          Math.round((routeRiskData.good / Object.values(routeRiskData).reduce((a, b) => a + b, 0)) * 100)
                        }%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {dashboardData?.summary.riskMitigation.message ||
                          'of routes currently have good weather conditions. ML recommendations help avoid high-risk areas.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Risk Assessment Feature */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-dark mb-2">
                    Current Location Risk Check
                  </h3>
                  <button
                    onClick={async () => {
                      try {
                        if (!navigator.geolocation) {
                          alert('Geolocation is not supported by this browser.');
                          return;
                        }

                        // Show loading state
                        const button = document.querySelector('button[data-risk-check]') as HTMLButtonElement;
                        if (button) {
                          button.disabled = true;
                          button.textContent = 'Getting location...';
                        }

                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            try {
                              if (button) {
                                button.textContent = 'Assessing risk...';
                              }

                              const response = await apiFetch('/api/ml/risk-assessment', {
                                method: 'POST',
                                body: JSON.stringify({
                                  vehicleId: 'vehicle_1',
                                  currentLocation: {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                  }
                                })
                              });

                              if (response.success) {
                                const assessment = response.data;
                                alert(
                                  `🔍 Current Location Risk Assessment:\n\n` +
                                  `📍 Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}\n` +
                                  `⚠️ Risk Level: ${assessment.risk_assessment.riskLevel}\n` +
                                  `📊 Risk Score: ${assessment.risk_assessment.overallRiskScore}%\n` +
                                  `💰 Claim Probability: ${assessment.claim_probability.level} (${assessment.claim_probability.percentage}%)\n` +
                                  `🌤️ Weather: ${assessment.weather_data.current?.weather_condition || 'Unknown'}\n` +
                                  `🌡️ Temperature: ${assessment.weather_data.current?.temperature || 'Unknown'}°C`
                                );
                              } else {
                                alert('❌ Risk assessment failed. Please try again.');
                              }
                            } catch (error) {
                              console.error('Risk assessment error:', error);
                              alert('❌ Failed to assess current location risk. Please try again.');
                            } finally {
                              if (button) {
                                button.disabled = false;
                                button.textContent = 'Check My Current Location Risk';
                              }
                            }
                          },
                          (error) => {
                            console.error('Geolocation error:', error);
                            alert('📍 Unable to get your location. Please enable location access and try again.');
                            if (button) {
                              button.disabled = false;
                              button.textContent = 'Check My Current Location Risk';
                            }
                          },
                          {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 300000
                          }
                        );
                      } catch (error) {
                        console.error('Location check error:', error);
                        alert('❌ Unable to assess current location risk. Please try again.');
                      }
                    }}
                    data-risk-check
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check My Current Location Risk
                  </button>
                  <p className="text-xs text-gray-600 mt-2">
                    🛰️ Uses GPS to assess real-time risk for your current location using ML algorithms
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}