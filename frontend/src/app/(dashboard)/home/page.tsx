import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/UI/table";
import { Progress } from "@radix-ui/react-progress";
import { Table } from "lucide-react";
// import { useSession } from "next-auth/react";

export default function DashboardPage() {
  // const { data: session } = useSession();
  // const userName = session?.user?.name || "Valued Customer";

  return (
    <main className="flex flex-1">
      <div className="flex min-h-screen w-full flex-col">
        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {"Valued Customer"}!
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening with your insurance portfolio today.
              </p>
            </div>
            <Avatar>
              {/* <AvatarImage src={session?.user?.image} /> */}
              <AvatarFallback>
                {/* {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")} */}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Policies
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last quarter
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Annual Premium
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,450</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last year
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Claims This Year
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  -1 from last year
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Renewals Due
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <Progress value={40} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Next due in 14 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>
                Your recent insurance claim activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
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
                  {[
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
                    {
                      policy: "Health - Family Plan",
                      date: "2023-06-05",
                      type: "Medical",
                      status: "Processed",
                      amount: "$1,200.00",
                    },
                    {
                      policy: "Life - Term Policy",
                      date: "2023-05-28",
                      type: "Premium Payment",
                      status: "Completed",
                      amount: "$150.00",
                    },
                    {
                      policy: "Auto - 2021 Toyota RAV4",
                      date: "2023-05-15",
                      type: "Theft",
                      status: "Paid",
                      amount: "$18,750.00",
                    },
                  ].map((claim, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {claim.policy}
                      </TableCell>
                      <TableCell>{claim.date}</TableCell>
                      <TableCell>{claim.type}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            claim.status === "Approved" ||
                            claim.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : claim.status === "In Review"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {claim.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </main>
  );
}
