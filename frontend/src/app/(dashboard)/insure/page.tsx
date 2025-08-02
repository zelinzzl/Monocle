"use client"

import { useState, useEffect } from 'react';
import RiskSummaryCard from "@/components/dashboard/RiskSummaryCard";
import RouteRiskChart from "@/components/dashboard/RouteRiskChart";
import { AlertTriangleIcon, CloudRainIcon, ShieldIcon, CarIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import { mlService, type WeatherAlert, type RouteRiskData } from '@/services/mlService';

interface DashboardData {
  formattedAlerts: WeatherAlert[];
  routeRiskData: RouteRiskData;
  recommendations: string[];
  summary: {
    protectedRoutes: number;
    atRiskRoutes: number;
    monitoredVehicles: number;
    riskMitigation: number;
  };
  mlDashboard: any;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await mlService.getComprehensiveDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Using fallback data.');
      
      // Load fallback data
      const fallbackData = await mlService.getComprehensiveDashboardData();
      setDashboardData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !dashboardData) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark">
            Travel Risk Dashboard
          </h1>
          <p className="text-muted-foreground">
            Loading real-time weather and risk data...
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark">
            Travel Risk Dashboard
          </h1>
          <p className="text-red-500">
            Unable to load dashboard data. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const { formattedAlerts, routeRiskData, recommendations, summary } = dashboardData;

  const riskSummaries = [
    {
      title: 'Protected Routes',
      count: summary.protectedRoutes,
      icon: <ShieldIcon className="h-6 w-6 text-green-500" />,
      color: 'bg-green-100 text-green-800',
      description: 'Routes with minimal weather risks'
    },
    {
      title: 'At-Risk Routes',
      count: summary.atRiskRoutes,
      icon: <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
      color: 'bg-red-100 text-red-800',
      description: 'Routes with potential weather hazards'
    },
    {
      title: 'Monitored Vehicles',
      count: summary.monitoredVehicles,
      icon: <CarIcon className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-100 text-blue-800',
      description: 'Vehicles currently being tracked'
    }
  ];

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
                    Monitor weather-related travel risks in real-time
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated}
                  </p>
                  <button
                    onClick={loadDashboardData}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>
              )}
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
                    <h2 className="text-lg font-semibold">Recent Weather Alerts</h2>
                    <span className="text-sm text-muted-foreground">
                      {formattedAlerts.length} active alerts
                    </span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {formattedAlerts.length > 0 ? (
                      formattedAlerts.map((alert) => (
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
                  <ul className="space-y-3">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="mt-0.5 mr-3 text-lg">
                            {rec.substring(0, 2)}
                          </span>
                          <span>{rec.substring(2).trim()}</span>
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
                  Route Risk Analysis
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
                      Risk Mitigation
                    </h3>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-green-600">
                        {summary.riskMitigation}%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        of routes currently have good weather conditions. 
                        ML recommendations help avoid high-risk areas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Location Risk Assessment */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-dark mb-2">
                    Quick Risk Check
                  </h3>
                  <button
                    onClick={async () => {
                      try {
                        const assessment = await mlService.getCurrentLocationRiskAssessment();
                        if (assessment) {
                          alert(`Current Location Risk: ${assessment.risk_assessment.riskLevel} (${assessment.risk_assessment.overallRiskScore}%)\nClaim Probability: ${assessment.claim_probability.level} (${assessment.claim_probability.percentage}%)`);
                        }
                      } catch (error) {
                        alert('Unable to assess current location risk. Please enable location access.');
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Check Current Location Risk
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}