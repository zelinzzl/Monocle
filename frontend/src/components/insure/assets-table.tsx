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
            <TableHead>Vehicle</TableHead>
            <TableHead>Policy Number</TableHead>
            <TableHead>Monthly Premium</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Date Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No vehicles found. Add your first vehicle to get started with insurance quotes.
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
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{asset.itemName}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.year} {asset.make} {asset.model}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {asset.policyNumber || 'Pending'}
                </TableCell>
                <TableCell>
                  {asset.monthlyPayment > 0 
                    ? `R${asset.monthlyPayment.toFixed(2)}`
                    : 'Calculating...'
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(asset.status)}>
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskLevelBadgeVariant(asset.riskLevel)}>
                    {asset.riskLevel === 'pending' ? 'Assessing...' : asset.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(asset.dateAdded).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};