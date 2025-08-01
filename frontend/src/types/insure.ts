export interface InsuredAsset {
  id: string;
  itemName: string;
  status: "Active" | "Pending" | "Expired" | "Cancelled";
  monthlyPayment: number;
  riskLevel: "Low" | "Medium" | "High";
  category: string;
  dateAdded: string;
  description?: string;
  coverageAmount?: number;
  deductible?: number;
  policyNumber?: string;
}

export type SortBy = "itemName" | "monthlyPayment" | "riskLevel" | "dateAdded";
export type FilterBy = "all" | "active" | "pending" | "expired" | "cancelled";

export interface AssetsPageState {
  assets: InsuredAsset[];
  searchTerm: string;
  sortBy: SortBy;
  filterBy: FilterBy;
  selectedAssets: string[];
  selectedAsset: InsuredAsset | null;
}

export interface AssetFilters {
  searchTerm: string;
  sortBy: SortBy;
  filterBy: FilterBy;
}
