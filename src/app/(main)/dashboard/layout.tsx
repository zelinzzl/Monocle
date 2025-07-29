import ProtectedRoute from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="dashboard-container">{children}</div>
    </ProtectedRoute>
  );
}
