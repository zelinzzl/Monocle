"use client"

import { useState } from "react"
import { Input } from "@/components/UI/input"
import { Button } from "@/components/UI/button"
import { Pencil, Trash2, X } from "lucide-react"
import { Card, CardContent } from "@/components/UI/card"
import { Label } from "@/components/UI/label"
import Modal from "@/components/layout/Modal"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registration: string
  status: "Pending" | "Approved"
}

export default function VehicleSettingsTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filtered, setFiltered] = useState<Vehicle[]>([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const initialVehicle: Vehicle = {
    id: crypto.randomUUID(),
    make: "",
    model: "",
    year: new Date().getFullYear(),
    registration: "",
    status: "Pending",
  }

  const [current, setCurrent] = useState<Vehicle>(initialVehicle)

  const isFormValid =
    current.make.trim() !== "" &&
    current.model.trim() !== "" &&
    current.year >= 1900 &&
    current.registration.trim() !== ""

  const handleSaveVehicle = () => {
    if (!isFormValid) return

    if (isEditing) {
      setVehicles(prev =>
        prev.map(v => (v.id === current.id ? current : v))
      )
    } else {
      setVehicles(prev => [...prev, { ...current, status: "Pending" }])
    }

    setCurrent(initialVehicle)
    setShowModal(false)
    setIsEditing(false)
  }

  const handleDelete = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  const handleEdit = (vehicle: Vehicle) => {
    setCurrent(vehicle)
    setIsEditing(true)
    setShowModal(true)
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    const q = query.toLowerCase()
    const filteredList = vehicles.filter(
      v =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.year.toString().includes(q) ||
        v.registration.toLowerCase().includes(q)
    )
    setFiltered(filteredList)
  }

  const data = search ? filtered : vehicles

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vehicle Personalization</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Search make, model, year..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => {
              setCurrent(initialVehicle)
              setIsEditing(false)
              setShowModal(true)
            }}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="grid grid-cols-6 px-6 py-3 font-semibold text-sm border-b bg-muted/50">
            <span>Make</span>
            <span>Model</span>
            <span>Year</span>
            <span>Registration</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          {data.map(vehicle => (
            <div
              key={vehicle.id}
              className="grid grid-cols-6 px-6 py-4 items-center text-sm border-b hover:bg-muted/20"
            >
              <span>{vehicle.make}</span>
              <span>{vehicle.model}</span>
              <span>{vehicle.year}</span>
              <span>{vehicle.registration}</span>
              <span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    vehicle.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {vehicle.status}
                </span>
              </span>
              <div className="flex justify-end gap-2">
                {/* <Pencil
                  className="w-4 h-4 cursor-pointer hover:text-primary"
                  onClick={() => handleEdit(vehicle)}
                /> */}
                <Trash2
                  className="w-4 h-4 cursor-pointer hover:text-destructive"
                  onClick={() => handleDelete(vehicle.id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} closeOnOutsideClick>
          <div className="bg-background p-6 rounded-xl w-full max-w-lg space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {isEditing ? "Edit Vehicle" : "Add Vehicle"}
              </h3>
              <X
                className="w-5 h-5 cursor-pointer"
                onClick={() => setShowModal(false)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Make</Label>
                  <Input
                    value={current.make}
                    onChange={e =>
                      setCurrent({ ...current, make: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label>Model</Label>
                  <Input
                    value={current.model}
                    onChange={e =>
                      setCurrent({ ...current, model: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={current.year}
                  onChange={e =>
                    setCurrent({ ...current, year: parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label>Registration</Label>
                <Input
                  value={current.registration}
                  onChange={e =>
                    setCurrent({ ...current, registration: e.target.value })
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSaveVehicle}
                disabled={!isFormValid}
              >
                {isEditing ? "Update Vehicle" : "Save Vehicle"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  )
}
