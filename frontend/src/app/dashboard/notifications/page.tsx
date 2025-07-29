import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
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

export default function DashboardPage() {
  return (
    <main className="flex flex-1">
      <div className="flex min-h-screen w-full flex-col">
      <h1>Notifications Page</h1>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
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
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscriptions
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
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
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
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasks Completed
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
                <div className="text-2xl font-bold">12</div>
                <Progress value={80} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  4 remaining
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      customer: "Olivia Martin",
                      date: "2023-06-12",
                      amount: "$1,999.00",
                      status: "Completed",
                      method: "Credit Card",
                    },
                    {
                      customer: "Jackson Lee",
                      date: "2023-06-12",
                      amount: "$39.00",
                      status: "Pending",
                      method: "PayPal",
                    },
                    {
                      customer: "Isabella Nguyen",
                      date: "2023-06-11",
                      amount: "$299.00",
                      status: "Completed",
                      method: "Credit Card",
                    },
                    {
                      customer: "William Kim",
                      date: "2023-06-10",
                      amount: "$99.00",
                      status: "Completed",
                      method: "Bank Transfer",
                    },
                    {
                      customer: "Sofia Davis",
                      date: "2023-06-09",
                      amount: "$39.00",
                      status: "Pending",
                      method: "PayPal",
                    },
                  ].map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {transaction.customer}
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.status}</TableCell>
                      <TableCell className="text-right">
                        {transaction.method}
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
