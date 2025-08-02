'use client'
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useAuth } from '@/context/auth-context';
import { useAssetsManager } from "@/hooks/useAssetsManager";
import { AssetsPageHeader } from "@/components/insure/assets-page-header";
import { AssetsTable } from "@/components/insure/assets-table";
import { AssetsSummary } from "@/components/insure/assets-summary";
import { ItemInformationSheet } from "@/components/insure/item-information-sheet";
import { CreateAssetRequest } from "@/services/insuranceApi";
import { toast } from "sonner";

export default function InsuredAssetsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth state
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    assets,
    loading,
    searchTerm,
    sortBy,
    selectedAssets,
    selectedAsset,
    filteredAndSortedAssets,
    selectedAssetsDetails,
    showRemoveConfirmation,
    isRemoving,
    setSearchTerm,
    setSortBy,
    setSelectedAsset,
    setShowRemoveConfirmation,
    handleAddAsset,
    handleRemoveAssetsRequest,
    handleRemoveAssetsConfirmed,
    handleSaveAsset,
    toggleAssetSelection,
    handleSelectAll,
    handleRowClick,
    refreshAssets,
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
    user_id: "CURRENT_USER_ID",
    created_at: now,
    updated_at: now,
    itemName: newAsset.item_name,        // Changed from item_name
    category: newAsset.category,
    monthlyPayment: 0,                   // Changed from monthly_payment
    dateAdded: now,                      // Changed from date_added
    risk_level: "pending",
    status: "pending",
    make: newAsset.make,
    model: newAsset.model,
    year: newAsset.year,
    policy_number: newAsset.policy_number,
    description: newAsset.description,
    coverage_amount: 0,
    main_driver_age: newAsset.main_driver_age,
    risk_score: 0,
  };


  handleAddAsset(assetToAdd); // Must be implemented in useAssetsManager
  setShowAddModal(false);
  setNewAsset({
    item_name: "",
    category: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    primaryLocation: "",
    mainDriverAge: 25,
    description: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleNewAssetChange = (key: keyof CreateAssetRequest, value: any) => {
    setNewAsset((prev) => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (formErrors[key]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setNewAsset({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      primaryLocation: "",
      mainDriverAge: 25,
      description: "",
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newAsset.make.trim()) {
      errors.make = "Vehicle make is required";
    }
    if (!newAsset.model.trim()) {
      errors.model = "Vehicle model is required";
    }
    if (!newAsset.primaryLocation.trim()) {
      errors.primaryLocation = "Primary location is required";
    }
    if (newAsset.year < 1900 || newAsset.year > new Date().getFullYear() + 1) {
      errors.year = "Please enter a valid year";
    }
    if (newAsset.mainDriverAge < 16 || newAsset.mainDriverAge > 100) {
      errors.mainDriverAge = "Driver age must be between 16 and 100";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAsset = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const assetData: CreateAssetRequest = {
        make: newAsset.make.trim(),
        model: newAsset.model.trim(),
        year: newAsset.year,
        primaryLocation: newAsset.primaryLocation.trim(),
        mainDriverAge: newAsset.mainDriverAge,
        description: newAsset.description?.trim() || undefined,
      };

      await handleAddAsset(assetData);
      setShowAddModal(false);
      resetForm();
      toast.success("Vehicle added successfully! Processing risk assessment...");
    } catch (error) {
      console.error('Failed to create asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setShowAddModal(false);
      resetForm();
    }
  };

  // Calculate total monthly savings from removing selected assets
  const totalMonthlySavings = selectedAssetsDetails.reduce(
    (sum, asset) => sum + (asset.monthlyPayment || 0), 
    0
  );

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your insured assets.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Loading state for assets
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your insured assets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AssetsPageHeader
        selectedAssetsCount={selectedAssets.length}
        searchTerm={searchTerm}
        sortBy={sortBy}
        onAddAsset={() => setShowAddModal(true)}
        onRemoveAssets={handleRemoveAssetsRequest} // Updated to show confirmation
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
      />

      {/* Add a refresh button for debugging */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshAssets}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Empty state for when no assets exist */}
      {assets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold mb-2">No vehicles insured yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first vehicle to receive an instant insurance quote.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              Add Your First Vehicle
            </Button>
          </div>
        </div>
      ) : (
        <>
          <AssetsTable
            assets={filteredAndSortedAssets }
            selectedAssets={selectedAssets}
            onSelectAll={handleSelectAll}
            onSelectAsset={toggleAssetSelection}
            onRowClick={handleRowClick}
          />

          <AssetsSummary
            filteredAssets={filteredAndSortedAssets}
            totalAssets={assets.length}
          />
        </>
      )}

      <ItemInformationSheet
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSave={handleSaveAsset}
      />

      {/* Remove Assets Confirmation Dialog */}
      <ConfirmationDialog
        open={showRemoveConfirmation}
        onOpenChange={setShowRemoveConfirmation}
        title={`Remove ${selectedAssets.length} Vehicle${selectedAssets.length > 1 ? 's' : ''} from Policy?`}
        description={`Are you sure you want to remove ${selectedAssets.length === 1 ? 'this vehicle' : 'these vehicles'} from your insurance policy? This action cannot be undone.`}
        confirmText={isRemoving ? "Removing..." : "Yes, Remove"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleRemoveAssetsConfirmed}
      >
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Vehicles to be removed:</h4>
            <div className="space-y-2">
              {selectedAssetsDetails.map((asset) => (
                <div key={asset.id} className="flex justify-between items-center p-2 bg-background rounded border">
                  <div className="flex-1">
                    <p className="font-medium">{asset.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      Policy: {asset.policyNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R{asset.monthlyPayment?.toFixed(2) || '0.00'}/month</p>
                    <Badge variant="outline" className="text-xs">
                      {asset.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalMonthlySavings > 0 && (
            <Alert>
              <AlertDescription>
                <strong>Monthly Premium Reduction:</strong> R{totalMonthlySavings.toFixed(2)}
                <br />
                <span className="text-sm text-muted-foreground">
                  Your policy will be updated immediately after removal.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ConfirmationDialog>

      {/* Add Asset Modal */}
      <Dialog open={showAddModal} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle for Insurance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make" className="text-sm font-medium">
                  Vehicle Make *
                </Label>
                <Input
                  id="make"
                  placeholder="e.g., Toyota, BMW, Ford"
                  value={newAsset.make}
                  onChange={(e) => handleNewAssetChange("make", e.target.value)}
                  className={formErrors.make ? "border-destructive" : ""}
                />
                {formErrors.make && (
                  <p className="text-sm text-destructive mt-1">{formErrors.make}</p>
                )}
              </div>
              <div>
                <Label htmlFor="model" className="text-sm font-medium">
                  Vehicle Model *
                </Label>
                <Input
                  id="model"
                  placeholder="e.g., Corolla, X3, Focus"
                  value={newAsset.model}
                  onChange={(e) => handleNewAssetChange("model", e.target.value)}
                  className={formErrors.model ? "border-destructive" : ""}
                />
                {formErrors.model && (
                  <p className="text-sm text-destructive mt-1">{formErrors.model}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" className="text-sm font-medium">
                  Year *
                </Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={newAsset.year}
                  onChange={(e) => handleNewAssetChange("year", parseInt(e.target.value, 10) || new Date().getFullYear())}
                  className={formErrors.year ? "border-destructive" : ""}
                />
                {formErrors.year && (
                  <p className="text-sm text-destructive mt-1">{formErrors.year}</p>
                )}
              </div>
              <div>
                <Label htmlFor="mainDriverAge" className="text-sm font-medium">
                  Main Driver Age *
                </Label>
                <Input
                  id="mainDriverAge"
                  type="number"
                  min="16"
                  max="100"
                  placeholder="e.g., 25"
                  value={newAsset.mainDriverAge}
                  onChange={(e) => handleNewAssetChange("mainDriverAge", parseInt(e.target.value, 10) || 25)}
                  className={formErrors.mainDriverAge ? "border-destructive" : ""}
                />
                {formErrors.mainDriverAge && (
                  <p className="text-sm text-destructive mt-1">{formErrors.mainDriverAge}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="primaryLocation" className="text-sm font-medium">
                Primary Location *
              </Label>
              <Input
                id="primaryLocation"
                placeholder="e.g., Johannesburg, Cape Town, Durban"
                value={newAsset.primaryLocation}
                onChange={(e) => handleNewAssetChange("primaryLocation", e.target.value)}
                className={formErrors.primaryLocation ? "border-destructive" : ""}
              />
              {formErrors.primaryLocation && (
                <p className="text-sm text-destructive mt-1">{formErrors.primaryLocation}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Enter the city or area where the vehicle is primarily kept
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Additional details about the vehicle..."
                value={newAsset.description}
                onChange={(e) => handleNewAssetChange("description", e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newAsset.description?.length || 0}/500 characters
              </p>
            </div>

            <Alert>
              <AlertDescription>
                <p><strong>What happens next:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                  <li>Unique policy number generation</li>
                  <li>AI-powered risk assessment</li>
                  <li>Instant premium calculation</li>
                  <li>Coverage amount determination</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => handleModalClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAsset}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}