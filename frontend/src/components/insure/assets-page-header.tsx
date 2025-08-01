"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icons/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortBy, FilterBy } from "@/types/insure";

interface AssetsPageHeaderProps {
  selectedAssetsCount: number;
  searchTerm: string;
  sortBy: SortBy;
  filterBy: FilterBy;
  onAddAsset: () => void;
  onRemoveAssets: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortBy) => void;
  onFilterChange: (value: FilterBy) => void;
}

export const AssetsPageHeader = ({
  selectedAssetsCount,
  searchTerm,
  sortBy,
  filterBy,
  onAddAsset,
  onRemoveAssets,
  onSearchChange,
  onSortChange,
  onFilterChange,
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Icon name="Filter" isLottie className="h-4 w-4" />
                Filter/Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filterBy}
                onValueChange={(value) => onFilterChange(value as FilterBy)}
              >
                <DropdownMenuRadioItem value="all">
                  All Statuses
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">
                  Active
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expired">
                  Expired
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cancelled">
                  Cancelled
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => onSortChange(value as SortBy)}
              >
                <DropdownMenuRadioItem value="itemName">
                  Insured Item
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthlyPayment">
                  Monthly Payment
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="riskLevel">
                  Risk Level
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dateAdded">
                  Date Added
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
