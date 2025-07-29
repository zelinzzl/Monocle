"use client"

import { useState } from "react"
import { Input } from "@/components/UI/input"
import { Button } from "@/components/UI/button"
import { Pencil, Trash2, X } from "lucide-react"
import { Card, CardContent } from "@/components/UI/card"
import Modal from "@/components/layout/Modal"

interface TravelRisk {
  id: string
  name: string
  riskLevel: "High" | "Medium" | "Low"
  lastChecked: string
}

export default function TravelRiskTable() {
  const [risks, setRisks] = useState<TravelRisk[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newRisk, setNewRisk] = useState({ id: "", name: "", riskLevel: "Low" })
  const [isEditing, setIsEditing] = useState(false)

  const resetForm = () => {
    setNewRisk({ id: "", name: "", riskLevel: "Low" })
    setIsEditing(false)
  }

  const handleAddRisk = () => {
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

    const risk: TravelRisk = {
      id: `T${Math.floor(Math.random() * 1000)}`,
      name: newRisk.name,
      riskLevel: newRisk.riskLevel as TravelRisk["riskLevel"],
      lastChecked: currentDate,
    }

    setRisks(prev => [...prev, risk])
    setShowModal(false)
    resetForm()
  }

  const handleUpdateRisk = () => {
    const updatedRisks = risks.map(r =>
      r.id === newRisk.id ? { ...r, name: newRisk.name, riskLevel: newRisk.riskLevel } : r
    )
    setRisks(updatedRisks)
    setShowModal(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id))
  }

  const handleEdit = (risk: TravelRisk) => {
    setNewRisk(risk)
    setIsEditing(true)
    setShowModal(true)
  }

  return (
    <main className="flex flex-1">
      <div className="flex min-h-screen w-full flex-col">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Travel Risks</h2>
            <div className="flex items-center gap-2">
              <Input placeholder="Search..." className="w-64" />
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
              >
                ADD NEW RISK
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-5 px-6 py-3 text-sm font-semibold  border-b">
                <span>ID</span>
                <span>Name</span>
                <span>Risk Level</span>
                <span>Last Checked</span>
                <span className="text-right">Actions</span>
              </div>

              {risks.map((risk, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 items-center px-6 py-4 border-b hover:bg-gray-50"
                >
                  <span>{risk.id}</span>
                  <span>{risk.name}</span>
                  <span>{risk.riskLevel}</span>
                  <span>{risk.lastChecked}</span>
                  <div className="flex justify-end gap-3 text-purple-600">
                    <Pencil
                      className="h-4 w-4 cursor-pointer hover:text-purple-800"
                      onClick={() => handleEdit(risk)}
                    />
                    <Trash2
                      className="h-4 w-4 cursor-pointer hover:text-red-600"
                      onClick={() => handleDelete(risk.id)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Modal */}
        {showModal && (
          <Modal onClose={() => setShowModal(false)} closeOnOutsideClick>
            <div className="bg-light rounded-xl shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {isEditing ? "Edit Travel Risk" : "Add New Travel Risk"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                >
                  <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={newRisk.name}
                  onChange={e => setNewRisk({ ...newRisk, name: e.target.value })}
                />
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={newRisk.riskLevel}
                  onChange={e =>
                    setNewRisk({ ...newRisk, riskLevel: e.target.value })
                  }
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700 w-full"
                  onClick={isEditing ? handleUpdateRisk : handleAddRisk}
                >
                  {isEditing ? "Update Risk" : "Add Risk"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </main>
  )
}
