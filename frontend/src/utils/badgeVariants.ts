export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Active":
      return "default";
    case "Pending":
      return "secondary";
    case "Expired":
      return "destructive";
    case "Cancelled":
      return "outline";
    default:
      return "default";
  }
};

export const getRiskLevelBadgeVariant = (riskLevel: string) => {
  switch (riskLevel) {
    case "Low":
      return "secondary";
    case "Medium":
      return "default";
    case "High":
      return "destructive";
    default:
      return "default";
  }
};
