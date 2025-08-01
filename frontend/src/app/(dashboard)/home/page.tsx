"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

export default function DashboardPage() {
  const router = useRouter();

  // Mock data
  const claims = [
    {
      policy: "Auto - 2023 Honda Accord",
      date: "2023-06-12",
      type: "Collision",
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Example stat card */}
        <Card>
          <CardHeader>
            <CardTitle>Claims This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-sm text-muted-foreground">+2 this quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.filter((c) => c.status !== "Paid").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending resolution</p>
          </CardContent>
        </Card>
        <Card>
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
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processed Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              3 of 4 processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recently Viewed Claims */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Viewed Claims</CardTitle>
          <CardDescription>
            Quick access to claims you checked recently
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
      </Card>

      {/* Claims History Table */}
      <Card>
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
      </Card>

      {/* Submit + Close Claims */}
      <div className="flex justify-between gap-4">
        <Button onClick={() => router.push("/claims/new")}>
          Submit New Claim
        </Button>
        <Button variant="outline" disabled>
          Close Selected Claims
        </Button>
      </div>
    </main>
  );
}
