"use client";

import { useState } from "react";
import { InsuredAsset, SortBy } from "@/types/insure";
import { mockAssets } from "@/data/mockAssets";
import { filterAndSortAssets } from "@/utils/assetFilters";

export const useAssetsManager = () => {
  const [assets, setAssets] = useState<InsuredAsset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("itemName");
  // const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<InsuredAsset | null>(null);

  const filteredAndSortedAssets = filterAndSortAssets(assets, {
    searchTerm,
    sortBy,
    // filterBy,
  });

  const handleAddAsset = () => {
    console.log("Add new asset");
  };

  const handleRemoveAssets = () => {
    if (selectedAssets.length > 0) {
      setAssets(assets.filter((asset) => !selectedAssets.includes(asset.id)));
      setSelectedAssets([]);
    }
  };

  const handleSaveAsset = (updatedAsset: InsuredAsset) => {
    setAssets(
      assets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    );
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(filteredAndSortedAssets.map((asset) => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const handleRowClick = (asset: InsuredAsset) => {
    setSelectedAsset(asset);
  };

  return {
    // State
    assets,
    searchTerm,
    sortBy,
    // filterBy,
    selectedAssets,
    selectedAsset,
    filteredAndSortedAssets,

    // Setters
    setSearchTerm,
    setSortBy,
    // setFilterBy,
    setSelectedAsset,

    // Actions
    handleAddAsset,
    handleRemoveAssets,
    handleSaveAsset,
    toggleAssetSelection,
    handleSelectAll,
    handleRowClick,
  };
};
