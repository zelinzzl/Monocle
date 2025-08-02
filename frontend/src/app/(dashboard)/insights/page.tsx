"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, CloudSun, AlertTriangle, Wind } from "lucide-react";

export default function RiskInsightsPage() {
  const frequentRoutes = [
    {
      name: "Work Commute",
      route: "123 Main St → 456 Office Park",
      recentWeather: "Hail and high wind alert",
      icon: <AlertTriangle className="text-yellow-600" />,
    },
    {
      name: "Gym Route",
      route: "456 Office Park → 789 Gym Rd",
      recentWeather: "Clear skies, moderate wind",
      icon: <CloudSun className="text-blue-500" />,
    },
    {
      name: "Weekend Drive",
      route: "789 Home Ave → Coastal Road",
      recentWeather: "Flooding reported last weekend",
      icon: <Wind className="text-red-500" />,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Historical Risk Insights for Frequently Traveled Routes
      </h1>
      <p className="text-muted-foreground mb-6">
        Review recent and historical weather-related risks linked to your daily and favorite travel paths.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {frequentRoutes.map((route, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader className="flex items-center gap-2">
              {route.icon}
              <CardTitle className="text-base font-semibold">
                {route.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <span>{route.route}</span>
              </div>
              <Separator className="my-2" />
              <div className="text-muted-foreground">{route.recentWeather}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
