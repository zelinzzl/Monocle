// hooks/useAssetsManager.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { insuranceApi, InsuranceAsset, CreateAssetRequest, UpdateAssetRequest } from '@/services/insuranceApi';
import { SortBy } from '@/types/insure';

export const useAssetsManager = () => {
  const [assets, setAssets] = useState<InsuranceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('dateAdded');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<InsuranceAsset | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Get auth state to know when we're ready to make API calls
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();

  // Load assets when authentication is ready
  useEffect(() => {
    if (!authLoading && isAuthenticated && accessToken) {
      console.log('🔄 Auth ready, loading assets...');
      loadAssets();
    } else if (!authLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, stopping asset load');
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, accessToken]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading assets...');
      console.log('🔑 Access token available:', !!accessToken);
      
      const userAssets = await insuranceApi.getUserAssets();
      console.log('✅ Assets loaded:', userAssets.length);
      setAssets(userAssets);
    } catch (error) {
      console.error('❌ Failed to load assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter(asset =>
      asset.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'itemName':
          return a.itemName.localeCompare(b.itemName);
        case 'monthlyPayment':
          return b.monthlyPayment - a.monthlyPayment;
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'riskLevel':
          const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
          return (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0) - 
                 (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assets, searchTerm, sortBy]);

  // Get selected assets details for confirmation dialog
  const selectedAssetsDetails = useMemo(() => {
    return assets.filter(asset => selectedAssets.includes(asset.id));
  }, [assets, selectedAssets]);

  // Add new asset
  const handleAddAsset = async (assetData: CreateAssetRequest) => {
    try {
      const newAsset = await insuranceApi.createAsset(assetData);
      setAssets(prev => [newAsset, ...prev]);
      toast.success('Asset added successfully');

      // Automatically process the asset for risk assessment
      try {
        await handleProcessAsset(newAsset.id);
      } catch (processError) {
        console.error('Failed to process asset:', processError);
        toast.warning('Asset added but risk assessment failed. You can process it manually.');
      }
    } catch (error) {
      console.error('Failed to add asset:', error);
      toast.error('Failed to add asset');
      throw error;
    }
  };

  // Process asset for risk assessment
  const handleProcessAsset = async (assetId: string) => {
    try {
      const result = await insuranceApi.processAsset(assetId);
      
      // Update the asset in our local state
      setAssets(prev => prev.map(asset => 
        asset.id === assetId ? result.asset : asset
      ));

      toast.success(`Asset processed successfully. Risk Level: ${result.assessment.riskLevel}`);
      return result;
    } catch (error) {
      console.error('Failed to process asset:', error);
      toast.error('Failed to process asset for insurance');
      throw error;
    }
  };

  // Update asset
  const handleSaveAsset = async (updatedAsset: InsuranceAsset) => {
    try {
      const updateData: UpdateAssetRequest = {
        make: updatedAsset.make,
        model: updatedAsset.model,
        year: updatedAsset.year,
        primaryLocation: updatedAsset.primaryLocation,
        mainDriverAge: updatedAsset.mainDriverAge,
        description: updatedAsset.description,
      };

      const savedAsset = await insuranceApi.updateAsset(updatedAsset.id, updateData);
      
      setAssets(prev => prev.map(asset => 
        asset.id === savedAsset.id ? savedAsset : asset
      ));
      
      setSelectedAsset(savedAsset);
      toast.success('Asset updated successfully');
    } catch (error) {
      console.error('Failed to update asset:', error);
      toast.error('Failed to update asset');
      throw error;
    }
  };

  // Show remove confirmation dialog
  const handleRemoveAssetsRequest = () => {
    if (selectedAssets.length === 0) return;
    setShowRemoveConfirmation(true);
  };

  // Actually remove the assets (after confirmation)
  const handleRemoveAssetsConfirmed = async () => {
    if (selectedAssets.length === 0) return;

    try {
      setIsRemoving(true);
      
      // Delete assets from backend
      await Promise.all(selectedAssets.map(id => insuranceApi.deleteAsset(id)));
      
      // Update local state
      setAssets(prev => prev.filter(asset => !selectedAssets.includes(asset.id)));
      setSelectedAssets([]);
      
      toast.success(`${selectedAssets.length} vehicle(s) removed from your policy successfully`);
    } catch (error) {
      console.error('Failed to remove assets:', error);
      toast.error('Failed to remove vehicles from policy');
    } finally {
      setIsRemoving(false);
    }
  };

  // Selection handlers
  const toggleAssetSelection = useCallback((assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedAssets(checked ? filteredAndSortedAssets.map(asset => asset.id) : []);
  }, [filteredAndSortedAssets]);

  const handleRowClick = useCallback((asset: InsuranceAsset) => {
    setSelectedAsset(asset);
  }, []);

  // Manual refresh function
  const refreshAssets = useCallback(() => {
    if (isAuthenticated && accessToken) {
      loadAssets();
    }
  }, [isAuthenticated, accessToken]);

  return {
    assets,
    loading: loading || authLoading,
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
    handleProcessAsset,
    handleRemoveAssetsRequest, // This shows the confirmation
    handleRemoveAssetsConfirmed, // This actually removes after confirmation
    handleSaveAsset,
    toggleAssetSelection,
    handleSelectAll,
    handleRowClick,
    loadAssets,
    refreshAssets,
  };
};