"use client";

import { InsuredAsset } from "@/types/insure";

interface AssetsSummaryProps {
  filteredAssets: InsuredAsset[];
  totalAssets: number;
}

export const AssetsSummary = ({
  filteredAssets,
  totalAssets,
}: AssetsSummaryProps) => {
  const totalMonthlyPremium = filteredAssets.reduce(
    (sum, asset) => sum + asset.monthlyPayment,
    0
  );

  return (
    <div className="flex justify-between items-center text-sm text-muted-foreground">
      <span>
        Showing {filteredAssets.length} of {totalAssets} assets
      </span>
      <span>Total Monthly Premium: R{totalMonthlyPremium.toFixed(2)}</span>
    </div>
  );
};
