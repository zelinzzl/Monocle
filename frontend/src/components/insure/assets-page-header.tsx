"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icons/Icon";
import { SortBy } from "@/types/insure";

interface AssetsPageHeaderProps {
  selectedAssetsCount: number;
  searchTerm: string;
  sortBy: SortBy;
  onAddAsset: () => void;
  onRemoveAssets: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortBy) => void;
}

export const AssetsPageHeader = ({
  selectedAssetsCount,
  searchTerm,
  onAddAsset,
  onRemoveAssets,
  onSearchChange,
}: AssetsPageHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Insured Assets</h1>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={onAddAsset} className="flex items-center gap-2">
            <Icon name="Plus" />
            Add
          </Button>

          <Button
            variant="destructive"
            onClick={onRemoveAssets}
            disabled={selectedAssetsCount === 0}
            className="flex items-center gap-2"
          >
            <Icon name="Minus" />
            Remove ({selectedAssetsCount})
          </Button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Icon
              name="SearchToX"
              isLottie
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
            />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
