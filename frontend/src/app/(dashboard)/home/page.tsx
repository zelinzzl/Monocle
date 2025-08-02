"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

  // Mock data
  // Sample JSON Data
  const routeRiskData = {
    critical: 12,
    high: 8,
    medium: 15,
    good: 23
  };
  
    // Alternative detailed format with additional metadata
    const detailedRouteData = {
      summary: {
        totalRoutes: 58,
        lastUpdated: "2024-08-02T10:30:00Z",
        alertsActive: 20
      },
      risks: {
        critical: {
          count: 12,
          percentage: 20.7,
          routes: [
            { id: 1, name: "N1 Highway - Cape Town to Paarl", condition: "Severe thunderstorm warning" },
            { id: 2, name: "R21 - Pretoria to OR Tambo", condition: "Heavy hail expected" }
          ]
        },
        high: {
          count: 8,
          percentage: 13.8,
          routes: [
            { id: 3, name: "M1 Highway - Johannesburg CBD", condition: "Heavy rainfall" },
            { id: 4, name: "N3 - Durban to Pietermaritzburg", condition: "Flooding risk" }
          ]
        },
        medium: {
          count: 15,
          percentage: 25.9,
          routes: [
            { id: 5, name: "R24 - Johannesburg to Rustenburg", condition: "Light rain showers" },
            { id: 6, name: "N2 - Port Elizabeth coastal route", condition: "Moderate wind" }
          ]
        },
        good: {
          count: 23,
          percentage: 39.7,
          routes: [
            { id: 7, name: "Garden Route - George to Knysna", condition: "Clear skies" },
            { id: 8, name: "Blue Route - Cape Town suburbs", condition: "Partly cloudy" }
          ]
        }
      }
    }
  ;
  
  
    const claims = [
      {
        policy: "Location A - Location B",
        date: "2023-06-12",
        type: "Risk level high",
        status: "Approved",
        amount: "$2,450.00",
      },
      {
        policy: "Home - 123 Main St",
        date: "2023-06-10",
        type: "Water Damage",
        status: "In Review",
        amount: "$5,200.00",
      },
    ];


    const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        const total = payload.reduce((sum, item) => sum + (item.value as number), 0);
        
        return (
          <div className="bg-white p-3 border rounded-lg shadow-lg">
            <p className="text-sm font-medium">{data.name}</p>
            <p className="text-sm text-gray-600">{data.value} routes</p>
            <p className="text-xs text-gray-500">
              {((Number(data.value) / total) * 100).toFixed(1)}%
            </p>
          </div>
        );
      }
      //return null;


      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Route Risk Distribution</CardTitle>
            <CardDescription>
              Overview of weather risk levels across all monitored routes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{data.critical + data.high}</div>
                <p className="text-sm text-muted-foreground">High Priority Routes</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.critical + data.high + data.medium + data.good}</div>
                <p className="text-sm text-muted-foreground">Total Monitored</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };
    

export default function DashboardPage() {
  const router = useRouter();

  const hasClaims = claims.length > 0;

  return (
    <main className="flex min-h-screen w-full flex-col p-4 md:p-8 gap-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your insurance portfolio today.
          </p>
        </div>
      </div>

      {/* CTA - Submit Claim if no claims */}
      {!hasClaims && (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">
              No claims submitted yet
            </h2>
            <p className="text-muted-foreground mb-4">
              Get started by submitting your first insurance claim.
            </p>
            <Button onClick={() => router.push("/claims/new")}>
              Submit New Claim
            </Button>
          </CardContent>
        </Card>
      )}

    <main className="grid gap-2 md:grid-cols-2">

      <section>
         {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Example stat card */}
        <Card>
          <CardHeader>
            <CardTitle>Insured Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-sm text-muted-foreground">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monitored Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.filter((c) => c.status !== "Paid").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending resolution</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Chat Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <Button
              variant="link"
              className="text-sm px-0"
              onClick={() => router.push("/chat")}
            >
              View latest conversation
            </Button>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Processed Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              3 of 4 processed
            </p>
          </CardContent>
        </Card> */}

      </div>

<br />

           {/* Recently Viewed Claims */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Viewed Routes</CardTitle>
          <CardDescription>
            Quick access to routes you checked recently
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {claims.slice(0, 2).map((claim, idx) => (
            <div
              key={idx}
              className="p-3 border rounded-md hover:bg-accent cursor-pointer"
              onClick={() => router.push(`/claims/${idx}`)}
            >
              <div className="font-medium">{claim.policy}</div>
              <div className="text-sm text-muted-foreground">{claim.type}</div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
        <br/>
      <Button onClick={() => router.push("/map")}>
          See All Routes
        </Button>

        </CardFooter>
      </Card>

        


      </section>


      <section>

{/* Route Risk Status Cards */}
  <div className="grid gap-4 grid-cols-2">
    <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Critical Risk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">12</div>
        <p className="text-xs text-red-100">Immediate attention needed</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          High Risk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">8</div>
        <p className="text-xs text-orange-100">Elevated weather risks</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Medium Risk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">15</div>
        <p className="text-xs text-yellow-100">Moderate conditions</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Good Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">23</div>
        <p className="text-xs text-green-100">Favorable weather</p>
      </CardContent>
    </Card>
  </div>


      </section>
    </main>
     
     

      {/* Claims History Table */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Claims History</CardTitle>
          <CardDescription>Details of your insurance claims</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim, index) => (
                <TableRow key={index}>
                  <TableCell>{claim.policy}</TableCell>
                  <TableCell>{claim.date}</TableCell>
                  <TableCell>{claim.type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        claim.status === "Approved" || claim.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : claim.status === "In Review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{claim.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </CardContent>
      </Card> */}

      {/* Submit + Close Claims */}
      {/* <div className="flex justify-between gap-4">
        <Button onClick={() => router.push("/claims/new")}>
          Submit New Claim
        </Button>
        <Button variant="outline" disabled>
          Close Selected Claims
        </Button>
      </div> */}

    </main>
  );
}
