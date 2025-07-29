import ProtectedRoute from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Uncomment the ProtectedRoute component to protect the dashboard layout
    // <ProtectedRoute>
    <div className="dashboard-container">{children}</div>
    // </ProtectedRoute>
  );
}
