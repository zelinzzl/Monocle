"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { InsuranceAsset, NewAssetForm } from "@/types/insurance"

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (asset: InsuranceAsset) => void
}

export function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
  const [formData, setFormData] = useState<NewAssetForm>({
    item_name: "",
    category: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    policy_number: "",
    description: "",
    main_driver_age: 25,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate AI processing for risk assessment
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate AI-determined values
    const riskLevels: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"]
    const statuses: ("Active" | "Pending" | "Expired" | "Cancelled")[] = ["Active", "Pending"]

    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
    const riskScore =
      riskLevel === "Low" ? Math.random() * 3 : riskLevel === "Medium" ? 3 + Math.random() * 3 : 6 + Math.random() * 4

    const basePayment = formData.year > 2020 ? 200 : 150
    const ageMultiplier = formData.main_driver_age < 25 ? 1.5 : formData.main_driver_age > 50 ? 0.8 : 1
    const monthlyPayment = basePayment * ageMultiplier * (riskScore / 5) + Math.random() * 100

    const newAsset: InsuranceAsset = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: "current-user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      date_added: new Date().toISOString(),
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      risk_level: riskLevel,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      coverage_amount: Math.round((15000 + Math.random() * 50000) / 1000) * 1000,
      risk_score: Math.round(riskScore * 10) / 10,
      ...formData,
    }

    onAdd(newAsset)
    setFormData({
      item_name: "",
      category: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      policy_number: "",
      description: "",
      main_driver_age: 25,
    })
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: keyof NewAssetForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Insurance Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Asset Name</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleInputChange("item_name", e.target.value)}
                placeholder="e.g., Honda Civic 2020"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                  <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="RV">RV</SelectItem>
                  <SelectItem value="Boat">Boat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
                placeholder="e.g., Honda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="e.g., Civic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_driver_age">Main Driver Age</Label>
              <Input
                id="main_driver_age"
                type="number"
                value={formData.main_driver_age}
                onChange={(e) => handleInputChange("main_driver_age", Number.parseInt(e.target.value))}
                min="16"
                max="100"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="policy_number">Policy Number</Label>
              <Input
                id="policy_number"
                value={formData.policy_number}
                onChange={(e) => handleInputChange("policy_number", e.target.value)}
                placeholder="e.g., POL-2024-001"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the asset..."
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">AI-Determined Fields</p>
            <p className="text-xs text-blue-600 mt-1">
              The following will be automatically calculated: Monthly Payment, Risk Level, Status, Coverage Amount, and
              Risk Score
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
