// hooks/useMlDashboard.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { mlService, type WeatherAlert, type RouteRiskData, type RiskAssessment } from '@/services/mlService';

interface UseMlDashboardOptions {
  refreshInterval?: number; // in milliseconds
  autoRefresh?: boolean;
  enableGeolocation?: boolean;
}

interface UseMlDashboardState {
  // Dashboard data
  summary: {
    protectedRoutes: number;
    atRiskRoutes: number;
    monitoredVehicles: number;
    riskMitigation: number;
  } | null;
  
  // Alerts and recommendations
  alerts: WeatherAlert[];
  recommendations: string[];
  
  // Charts data
  routeRiskData: RouteRiskData | null;
  
  // Current location assessment
  currentLocationRisk: RiskAssessment | null;
  
  // States
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Geolocation
  userLocation: { lat: number; lng: number } | null;
  locationError: string | null;
}

interface UseMlDashboardActions {
  refresh: () => Promise<void>;
  clearError: () => void;
  checkCurrentLocationRisk: () => Promise<void>;
  analyzeCustomRoute: (start: any, end: any, vehicleId: string) => Promise<any>;
  toggleAutoRefresh: () => void;
}

export function useMlDashboard(options: UseMlDashboardOptions = {}) {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    autoRefresh = true,
    enableGeolocation = true
  } = options;

  const [state, setState] = useState<UseMlDashboardState>({
    summary: null,
    alerts: [],
    recommendations: [],
    routeRiskData: null,
    currentLocationRisk: null,
    loading: true,
    error: null,
    lastUpdated: null,
    userLocation: null,
    locationError: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(autoRefresh);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await mlService.getComprehensiveDashboardData();
      
      setState(prev => ({
        ...prev,
        summary: data.summary,
        alerts: data.formattedAlerts,
        recommendations: data.recommendations,
        routeRiskData: data.routeRiskData,
        loading: false,
        lastUpdated: new Date(),
      }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(async () => {
    if (!enableGeolocation || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        locationError: 'Geolocation not supported'
      }));
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
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

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setState(prev => ({
        ...prev,
        userLocation,
        locationError: null,
      }));

      return userLocation;
    } catch (error) {
      const errorMessage = error instanceof GeolocationPositionError 
        ? `Geolocation error: ${error.message}`
        : 'Failed to get current location';
        
      setState(prev => ({
        ...prev,
        locationError: errorMessage,
      }));
      
      return null;
    }
  }, [enableGeolocation]);

  // Check current location risk
  const checkCurrentLocationRisk = useCallback(async () => {
    try {
      const location = state.userLocation || await getCurrentLocation();
      if (!location) return;

      const assessment = await mlService.performRiskAssessment({
        vehicleId: 'vehicle_1', // Default vehicle
        currentLocation: location,
      });

      setState(prev => ({
        ...prev,
        currentLocationRisk: assessment,
      }));

    } catch (error) {
      console.error('Error checking current location risk:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to assess current location risk',
      }));
    }
  }, [state.userLocation]); // Remove getCurrentLocation from dependencies

  // Analyze custom route
  const analyzeCustomRoute = useCallback(async (
    start: { lat: number; lng: number; name?: string },
    end: { lat: number; lng: number; name?: string },
    vehicleId: string
  ) => {
    try {
      const routeAnalysis = await mlService.analyzeRoute({
        start: {
          lat: start.lat,
          lng: start.lng,
          name: start.name || 'Start Location'
        },
        end: {
          lat: end.lat,
          lng: end.lng,
          name: end.name || 'End Location'
        },
        vehicleId,
        routeName: `${start.name || 'Start'} to ${end.name || 'End'}`,
      });

      return routeAnalysis;
    } catch (error) {
      console.error('Error analyzing custom route:', error);
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Toggle auto refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
  }, []);

  // Setup auto refresh
  useEffect(() => {
    if (autoRefreshEnabled && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadDashboardData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [autoRefreshEnabled, refreshInterval, loadDashboardData]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
    if (enableGeolocation) {
      getCurrentLocation();
    }
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Remove dependencies to run only once on mount

  // Check current location risk when location changes
  useEffect(() => {
    if (state.userLocation && !state.currentLocationRisk) {
      checkCurrentLocationRisk();
    }
  }, [state.userLocation]); // Remove checkCurrentLocationRisk dependency

  const actions: UseMlDashboardActions = {
    refresh: loadDashboardData,
    clearError,
    checkCurrentLocationRisk,
    analyzeCustomRoute,
    toggleAutoRefresh,
  };

  return {
    ...state,
    actions,
    autoRefreshEnabled,
    refreshInterval,
  };
}

// Additional utility hooks for specific ML features

// Hook for weather alerts only
export function useWeatherAlerts(coordinates?: { lat: number; lng: number }) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async (coords?: { lat: number; lng: number }) => {
    if (!coords && !coordinates) return;
    
    const location = coords || coordinates!;
    
    try {
      setLoading(true);
      setError(null);
      
      const weatherData = await mlService.getWeatherAlerts(location.lat, location.lng);
      const formattedAlerts = mlService.formatAlertsForDashboard(weatherData.alerts);
      
      setAlerts(formattedAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather alerts');
    } finally {
      setLoading(false);
    }
  }, [coordinates]);

  useEffect(() => {
    if (coordinates) {
      loadAlerts();
    }
  }, [coordinates, loadAlerts]);

  return {
    alerts,
    loading,
    error,
    refresh: loadAlerts,
  };
}

// Hook for route risk analysis
export function useRouteRisk() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRoute = useCallback(async (routeData: {
    start: { lat: number; lng: number; name?: string };
    end: { lat: number; lng: number; name?: string };
    waypoints?: { lat: number; lng: number }[];
    vehicleId: string;
    routeName?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mlService.analyzeRoute(routeData);
      setAnalysis(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze route';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analysis,
    loading,
    error,
    analyzeRoute,
    clearAnalysis: () => setAnalysis(null),
  };
}