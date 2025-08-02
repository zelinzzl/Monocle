"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, Trash2 } from "lucide-react"
import { InsuranceAsset } from "@/types/insurance"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/UI/table"
import { AddAssetModal } from "@/components/insure/add-asset-modal"
import { AssetDetailsSheet } from "@/components/insure/add-details-sheet"

// Mock data for demonstration
const mockAssets: InsuranceAsset[] = [
  {
    id: "1",
    user_id: "user-1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    item_name: "Honda Civic 2020",
    category: "Vehicle",
    monthly_payment: 245.5,
    date_added: "2024-01-15T10:00:00Z",
    risk_level: "Low",
    status: "Active",
    make: "Honda",
    model: "Civic",
    year: 2020,
    policy_number: "POL-2024-001",
    description: "Reliable daily commuter vehicle",
    coverage_amount: 25000,
    main_driver_age: 28,
    risk_score: 2.3,
  },
  {
    id: "2",
    user_id: "user-1",
    created_at: "2024-02-01T14:30:00Z",
    updated_at: "2024-02-01T14:30:00Z",
    item_name: "BMW X5 2022",
    category: "Vehicle",
    monthly_payment: 485.75,
    date_added: "2024-02-01T14:30:00Z",
    risk_level: "Medium",
    status: "Active",
    make: "BMW",
    model: "X5",
    year: 2022,
    policy_number: "POL-2024-002",
    description: "Luxury SUV for family use",
    coverage_amount: 55000,
    main_driver_age: 35,
    risk_score: 4.1,
  },
  {
    id: "3",
    user_id: "user-1",
    created_at: "2024-01-20T09:15:00Z",
    updated_at: "2024-01-20T09:15:00Z",
    item_name: "Motorcycle Yamaha R6",
    category: "Motorcycle",
    monthly_payment: 125.25,
    date_added: "2024-01-20T09:15:00Z",
    risk_level: "High",
    status: "Pending",
    make: "Yamaha",
    model: "R6",
    year: 2021,
    policy_number: "POL-2024-003",
    description: "Sport motorcycle for weekend rides",
    coverage_amount: 18000,
    main_driver_age: 26,
    risk_score: 7.8,
  },
]

export default function InsurePage() {
  const [assets, setAssets] = useState<InsuranceAsset[]>(mockAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date_added")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<InsuranceAsset | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)

  const filteredAndSortedAssets = useMemo(() => {
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || asset.status === statusFilter
      const matchesRisk = riskFilter === "all" || asset.risk_level === riskFilter

      return matchesSearch && matchesStatus && matchesRisk
    })

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof InsuranceAsset]
      let bValue: any = b[sortBy as keyof InsuranceAsset]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [assets, searchTerm, statusFilter, riskFilter, sortBy, sortOrder])

  const handleAddAsset = (newAsset: InsuranceAsset) => {
    setAssets((prev) => [...prev, newAsset])
  }

  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id))
  }

  const handleRowClick = (asset: InsuranceAsset) => {
    setSelectedAsset(asset)
    setIsDetailsSheetOpen(true)
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Expired":
        return "bg-red-100 text-red-800"
      case "Cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Insurance Assets</h1>
          <p className="text-muted-foreground">Manage your insured vehicles and assets</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
              <SelectValue>{statusFilter === "all" ? "Filter by status" : statusFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
              <SelectValue>{riskFilter === "all" ? "Filter by risk" : riskFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
              <SelectValue>{sortBy}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_added">Date Added</SelectItem>
                <SelectItem value="item_name">Name</SelectItem>
                <SelectItem value="monthly_payment">Monthly Payment</SelectItem>
                <SelectItem value="risk_score">Risk Score</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger>
              <SelectValue>{sortOrder}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assets ({filteredAndSortedAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Monthly Payment</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAssets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(asset)}
                  >
                    <TableCell className="font-medium">{asset.item_name}</TableCell>
                    <TableCell>
                      {asset.make} {asset.model}
                    </TableCell>
                    <TableCell>{asset.year}</TableCell>
                    <TableCell>${asset.monthly_payment.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(asset.risk_level)}>{asset.risk_level}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(asset.status)}>{asset.status}</Badge>
                    </TableCell>
                    <TableCell>${asset.coverage_amount.toLocaleString()}</TableCell>
                    <TableCell>{asset.risk_score.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAsset(asset.id)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddAsset} />

      <AssetDetailsSheet
        asset={selectedAsset}
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
      />
    </div>
  )
}
