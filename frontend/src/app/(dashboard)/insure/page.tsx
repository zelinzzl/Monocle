'use client'
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAssetsManager } from "@/hooks/useAssetsManager";
import { AssetsPageHeader } from "@/components/insure/assets-page-header";
import { AssetsTable } from "@/components/insure/assets-table";
import { AssetsSummary } from "@/components/insure/assets-summary";
import { ItemInformationSheet } from "@/components/insure/item-information-sheet";
import { v4 as uuidv4 } from "uuid";

// Inside your InsuredAssetsPage component:
export default function InsuredAssetsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    assets,
    searchTerm,
    sortBy,
    selectedAssets,
    selectedAsset,
    filteredAndSortedAssets,
    setSearchTerm,
    setSortBy,
    setSelectedAsset,
    handleAddAsset, // Make sure this exists in useAssetsManager
    handleRemoveAssets,
    handleSaveAsset,
    toggleAssetSelection,
    handleSelectAll,
    handleRowClick,
  } = useAssetsManager();




const [newAsset, setNewAsset] = useState({
  item_name: "",
  category: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  policy_number: "",
  description: "",
  main_driver_age: 18,
});

const handleNewAssetChange = (key: string, value: any) => {
  setNewAsset((prev) => ({ ...prev, [key]: value }));
};

const handleCreateAsset = () => {
  const now = new Date().toISOString();

  const assetToAdd = {
    id: uuidv4(),
    user_id: "CURRENT_USER_ID", // Replace with actual user ID
    created_at: now,
    updated_at: now,
    item_name: newAsset.item_name,
    category: newAsset.category,
    monthly_payment: 0, // Placeholder - AI-generated
    date_added: now,
    risk_level: "pending", // AI-generated
    status: "pending", // AI-generated
    make: newAsset.make,
    model: newAsset.model,
    year: newAsset.year,
    policy_number: newAsset.policy_number,
    description: newAsset.description,
    coverage_amount: 0, // AI-generated
    main_driver_age: newAsset.main_driver_age,
    risk_score: 0, // AI-generated
  };

  handleAddAsset(assetToAdd); // Must be implemented in useAssetsManager
  setShowAddModal(false);
  setNewAsset({
    item_name: "",
    category: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    policy_number: "",
    description: "",
    main_driver_age: 18,
  });
};


  return (
    <div className="container mx-auto p-6 space-y-6">
      <AssetsPageHeader
        selectedAssetsCount={selectedAssets.length}
        searchTerm={searchTerm}
        sortBy={sortBy}
        onAddAsset={() => setShowAddModal(true)}
        onRemoveAssets={handleRemoveAssets}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
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

      {/* Add Asset Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>Add New Insured Asset</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        placeholder="Item Name"
        value={newAsset.item_name}
        onChange={(e) => handleNewAssetChange("item_name", e.target.value)}
      />
      <Input
        placeholder="Category"
        value={newAsset.category}
        onChange={(e) => handleNewAssetChange("category", e.target.value)}
      />
      <Input
        placeholder="Make"
        value={newAsset.make}
        onChange={(e) => handleNewAssetChange("make", e.target.value)}
      />
      <Input
        placeholder="Model"
        value={newAsset.model}
        onChange={(e) => handleNewAssetChange("model", e.target.value)}
      />
      <Input
        type="number"
        placeholder="Year"
        value={newAsset.year}
        onChange={(e) => handleNewAssetChange("year", parseInt(e.target.value, 10))}
      />
      <Input
        placeholder="Policy Number"
        value={newAsset.policy_number}
        onChange={(e) => handleNewAssetChange("policy_number", e.target.value)}
      />
      <Input
        placeholder="Description"
        value={newAsset.description}
        onChange={(e) => handleNewAssetChange("description", e.target.value)}
      />
      <Input
        type="number"
        placeholder="Main Driver Age"
        value={newAsset.main_driver_age}
        onChange={(e) => handleNewAssetChange("main_driver_age", parseInt(e.target.value, 10))}
      />

      <div className="text-xs text-muted-foreground pt-2">
        <p><strong>Note:</strong> Fields like Monthly Payment, Risk Level, Status, Coverage Amount, and Risk Score will be calculated automatically by the AI agent after submission.</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
        <Button onClick={handleCreateAsset}>Add Asset</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
}
