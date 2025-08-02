"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InsuredAsset } from "@/types/insure";
import {
  getStatusBadgeVariant,
  getRiskLevelBadgeVariant,
} from "@/utils/badgeVariants";

interface AssetsTableProps {
  assets: InsuredAsset[];
  selectedAssets: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectAsset: (assetId: string) => void;
  onRowClick: (asset: InsuredAsset) => void;
}

export const AssetsTable = ({
  assets,
  selectedAssets,
  onSelectAll,
  onSelectAsset,
  onRowClick,
}: AssetsTableProps) => {
  const isAllSelected =
    selectedAssets.length === assets.length && assets.length > 0;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded"
              />
            </TableHead>
            <TableHead>Item Name</TableHead>
            {/* <TableHead>Category</TableHead> */}
            <TableHead>Monthly Payment</TableHead>
            <TableHead>Date Approved</TableHead>
            {/* <TableHead>Risk Level</TableHead> */}
            {/* <TableHead>Status</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No assets found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
              <TableRow
                key={asset.id}
                onClick={() => onRowClick(asset)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => onSelectAsset(asset.id)}
                    className="rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{asset.itemName}</TableCell>
                <TableCell>R{asset.monthlyPayment.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(asset.dateAdded).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                {/* <TableCell>
                  <Badge variant={getRiskLevelBadgeVariant(asset.riskLevel)}>
                    {asset.riskLevel}
                  </Badge>
                </TableCell> */}
                {/* <TableCell>
                  <Badge variant={getStatusBadgeVariant(asset.status)}>
                    {asset.status}
                  </Badge>
                </TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
