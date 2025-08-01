"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Modal from "@/components/layout/Modal"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  vulnerabilities: {
    hail: boolean
    rain: boolean
    floods: boolean
    wind: boolean
    crime: boolean
  }
}

export default function VehicleSettings() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showModal, setShowModal] = useState(false)
  const [current, setCurrent] = useState<Vehicle>({
    id: crypto.randomUUID(),
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vulnerabilities: {
      hail: false,
      rain: false,
      floods: false,
      wind: false,
      crime: false
    }
  })

  const isFormValid =
    current.make.trim() !== "" &&
    current.model.trim() !== "" &&
    current.year >= 1900

  const addVehicle = () => {
    if (!isFormValid) return
    setVehicles([...vehicles, current])
    setCurrent({
      id: crypto.randomUUID(),
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vulnerabilities: {
        hail: false,
        rain: false,
        floods: false,
        wind: false,
        crime: false
      }
    })
    setShowModal(false)
  }

  const handleCheckboxChange = (type: keyof Vehicle["vulnerabilities"]) => {
    setCurrent((prev) => ({
      ...prev,
      vulnerabilities: {
        ...prev.vulnerabilities,
        [type]: !prev.vulnerabilities[type]
      }
    }))
  }

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-4">Vehicle Personalization</h2>

      <Button onClick={() => setShowModal(true)} className="mb-6">
        Add New Vehicle
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => (
          <Card key={v.id}>
            <CardHeader>
              <CardTitle>{v.make} {v.model} ({v.year})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p><strong>Risk Alerts:</strong></p>
              <ul className="list-disc list-inside">
                {Object.entries(v.vulnerabilities).map(([k, value]) =>
                  value ? <li key={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</li> : null
                )}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} closeOnOutsideClick>
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add a New Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Model</Label>
                  <Input
                    value={current.model}
                    onChange={(e) => setCurrent({ ...current, model: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Make</Label>
                  <Input
                    value={current.make}
                    onChange={(e) => setCurrent({ ...current, make: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div >
                <Label >Year</Label>
                <Input
                  type="number"
                  value={current.year}
                  onChange={(e) => setCurrent({ ...current, year: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-lg">Vehicle Vulnerabilities</Label>
                <div className="flex flex-col gap-2 pl-2">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={current.vulnerabilities.hail} onCheckedChange={() => handleCheckboxChange("hail")} />
                    Hail — risk to bodywork, windscreen, sunroof
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={current.vulnerabilities.rain} onCheckedChange={() => handleCheckboxChange("rain")} />
                    Heavy Rain — aquaplaning & reduced visibility
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={current.vulnerabilities.floods} onCheckedChange={() => handleCheckboxChange("floods")} />
                    Floods — low ground clearance or water-sensitive engine
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={current.vulnerabilities.wind} onCheckedChange={() => handleCheckboxChange("wind")} />
                    High Winds — unstable for motorcycles, vans, or roof boxes
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={current.vulnerabilities.crime} onCheckedChange={() => handleCheckboxChange("crime")} />
                    Crime Risk — known car theft or hijacking hotspots
                  </label>
                </div>
              </div>

              <Button
                onClick={addVehicle}
                disabled={!isFormValid}
                className="w-full mt-4 disabled:opacity-50"
              >
                Save Vehicle
              </Button>
            </CardContent>
          </Card>
        </Modal>
      )}
    </div>
  )
}
