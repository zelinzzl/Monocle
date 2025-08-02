"use client";

import RiskSummaryCard from "@/components/dashboard/RiskSummaryCard";
import RouteRiskChart from "@/components/dashboard/RouteRiskChart";
import { AlertTriangleIcon, CloudRainIcon, ShieldIcon, CarIcon } from 'lucide-react';

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const routeRiskData = {
    critical: 12,
    high: 8,
    medium: 15,
    good: 23
  };
  const recentAlerts = [{
    id: 1,
    title: 'Severe hailstorm warning',
    location: 'N1 Highway, Midrand',
    time: '15 minutes ago',
    icon: <CloudRainIcon className="h-5 w-5 text-red-500" />
  }, {
    id: 2,
    title: 'Flash flood alert',
    location: 'R21 near OR Tambo',
    time: '35 minutes ago',
    icon: <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
  }, {
    id: 3,
    title: 'Heavy rain warning',
    location: 'M1 South, Johannesburg',
    time: '1 hour ago',
    icon: <CloudRainIcon className="h-5 w-5 text-amber-500" />
  }];
  const riskSummaries = [{
    title: 'Protected Routes',
    count: routeRiskData.good,
    icon: <ShieldIcon className="h-6 w-6 text-green-500" />,
    color: 'bg-green-100 text-green-800',
    description: 'Routes with minimal weather risks'
  }, {
    title: 'At-Risk Routes',
    count: routeRiskData.critical + routeRiskData.high + routeRiskData.medium,
    icon: <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
    color: 'bg-red-100 text-red-800',
    description: 'Routes with potential weather hazards'
  }, {
    title: 'Monitored Vehicles',
    count: 5,
    icon: <CarIcon className="h-6 w-6 text-blue-500" />,
    color: 'bg-blue-100 text-blue-800',
    description: 'Vehicles currently being tracked'
  }];
  return (
    <main >



    
   <div >
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark">
              Travel Risk Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor weather-related travel risks in real-time
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Cards */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {riskSummaries.map((summary, index) => <RiskSummaryCard key={index} title={summary.title} count={summary.count} icon={summary.icon} color={summary.color} description={summary.description} />)}
              </div>
              <div className="bg-background rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Recent Weather Alerts
                </h2>
                <div className="space-y-4">
                  {recentAlerts.map(alert => <div key={alert.id} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
                      <div className="p-2 rounded-full bg-sidebar mr-3">
                        {alert.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.location}
                        </p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>)}
                </div>
              </div>
              <div className="bg-background rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-dark">
                  Travel Recommendations
                </h2>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    Avoid N1 Highway near Midrand due to severe hail forecast
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    Consider alternative routes to R21 due to flash flood
                    warnings
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    M5 and N2 routes currently showing good weather conditions
                  </li>
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
                      <span className="font-medium">
                        {routeRiskData.critical}
                      </span>
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
                      <span className="font-medium">
                        {routeRiskData.medium}
                      </span>
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
                  <p className="mt-2 text-sm text-gray">
                    {Math.round(routeRiskData.good / Object.values(routeRiskData).reduce((a, b) => a + b, 0) * 100)}
                    % of routes currently have good weather conditions. Consider
                    rescheduling travel for high-risk routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    
    

    </main>
  );
}
