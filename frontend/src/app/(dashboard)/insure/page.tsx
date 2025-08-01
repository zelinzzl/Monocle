"use client";

import { AssetsPageHeader } from "@/components/insure/assets-page-header";
import { AssetsTable } from "@/components/insure/assets-table";
import { AssetsSummary } from "@/components/insure/assets-summary";
import { ItemInformationSheet } from "@/components/insure/item-information-sheet";
import { useAssetsManager } from "@/hooks/useAssetsManager";

export default function InsuredAssetsPage() {
  const {
    assets,
    searchTerm,
    sortBy,
    filterBy,
    selectedAssets,
    selectedAsset,
    filteredAndSortedAssets,
    setSearchTerm,
    setSortBy,
    setFilterBy,
    setSelectedAsset,
    handleAddAsset,
    handleRemoveAssets,
    handleSaveAsset,
    toggleAssetSelection,
    handleSelectAll,
    handleRowClick,
  } = useAssetsManager();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AssetsPageHeader
        selectedAssetsCount={selectedAssets.length}
        searchTerm={searchTerm}
        sortBy={sortBy}
        filterBy={filterBy}
        onAddAsset={handleAddAsset}
        onRemoveAssets={handleRemoveAssets}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />

      <AssetsTable
        assets={filteredAndSortedAssets}
        selectedAssets={selectedAssets}
        onSelectAll={handleSelectAll}
        onSelectAsset={toggleAssetSelection}
        onRowClick={handleRowClick}
      />

      <AssetsSummary
        filteredAssets={filteredAndSortedAssets}
        totalAssets={assets.length}
      />

      <ItemInformationSheet
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSave={handleSaveAsset}
      />
    </div>
  );
}
