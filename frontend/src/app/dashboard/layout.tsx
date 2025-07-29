import ProtectedRoute from "@/components/protected-route";
import { Sidebar } from "@/components/Dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Uncomment the ProtectedRoute component to protect the dashboard layout
    // <ProtectedRoute>
    <div className="dashboard-container">
      <div className="flex">
        <Sidebar />
        {children}
      </div>
    </div>

    // </ProtectedRoute>
  );
}
