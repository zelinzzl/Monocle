import { InsuredAsset } from "@/types/insure";

export interface AssetFilters {
  searchTerm: string;
  sortBy: "itemName" | "monthlyPayment" | "dateAdded" | "riskLevel";
}

export const filterAndSortAssets = (
  assets: InsuredAsset[],
  filters: AssetFilters
): InsuredAsset[] => {
  const { searchTerm, sortBy } = filters;

  return assets
    .filter((asset) => {
      const matchesSearch =
        asset.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ;
        // asset.category.toLowerCase().includes(searchTerm.toLowerCase());
      // const matchesFilter =
        // filterBy === "all" ||
        // asset.status.toLowerCase() === filterBy.toLowerCase();
      return matchesSearch ;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "itemName":
          return a.itemName.localeCompare(b.itemName);
        case "monthlyPayment":
          return b.monthlyPayment - a.monthlyPayment;
        // case "riskLevel":
        //   const riskOrder = { Low: 1, Medium: 2, High: 3 };
        //   return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case "dateAdded":
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
        default:
          return 0;
      }
    });
};
