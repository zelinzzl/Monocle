"use client";

import { useState } from "react";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import Modal from "@/components/layout/Modal";
import { Badge } from "@/components/UI/badge";

interface Claim {
  id: string;
  vehicle: string;
  year: string;
  region: string;
  incidentDate: string;
  description: string;
  estimatedAmount: string;
  status: "AI Reviewed" | "Pending";
  payout: string;
  disputed?: boolean;
  disputeMessage?: string;
}

export default function TravelRiskClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [vehicle, setVehicle] = useState("");
  const [year, setYear] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeComment, setDisputeComment] = useState("");

  const handleSubmitClaim = () => {
    const newClaim: Claim = {
      id: `TR-${Math.floor(Math.random() * 10000)}`,
      vehicle,
      year,
      region,
      incidentDate,
      description,
      estimatedAmount,
      status: "AI Reviewed",
      payout: "R42,000",
    };

    setClaims((prev) => [...prev, newClaim]);
    setShowModal(false);
    clearForm();
  };

  const clearForm = () => {
    setVehicle("");
    setYear("");
    setIncidentDate("");
    setRegion("");
    setDescription("");
    setEstimatedAmount("");
  };

  const handleDispute = () => {
    if (!activeClaim) return;
    const updatedClaims = claims.map((c) =>
      c.id === activeClaim.id
        ? {
            ...c,
            disputed: true,
            disputeMessage: disputeComment || disputeReason,
          }
        : c
    );
    setClaims(updatedClaims);
    setActiveClaim(null);
    setDisputeReason("");
    setDisputeComment("");
  };

  const isFormValid =
    vehicle && year && incidentDate && region && description && estimatedAmount;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Travel Risk – Claims
        </h2>
        <Button
          onClick={() => {
            setShowModal(true);
            clearForm();
          }}
          className="bg-background text-foreground hover:bg-muted"
        >
          Submit a New Claim
        </Button>
      </div>

      {claims.length === 0 ? (
        <p className="text-gray-500">No claims submitted yet.</p>
      ) : (
        claims.map((claim) => (
          <div
            key={claim.id}
            className="p-4 border rounded-xl space-y-4 bg-background shadow-sm"
          >
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="font-semibold">Claim ID: {claim.id}</p>
                <p>
                  Vehicle: {claim.year} {claim.vehicle}
                </p>
                <p>Region: {claim.region}</p>
                <p>
                  Status:{" "}
                  <Badge
                    variant="outline"
                    className="text-black bg-gray-100 border-none"
                  >
                    {claim.status}
                  </Badge>
                </p>
                <p>Payout Estimate: {claim.payout}</p>
              </div>
              {!claim.disputed && (
                <Button
                  variant="ghost"
                  className="text-sm text-foreground border border-gray-300 "
                  onClick={() => setActiveClaim(claim)}
                >
                  Dispute Decision
                </Button>
              )}
            </div>

            {claim.disputed && claim.disputeMessage && (
              <div className="text-sm bg-background border rounded-md p-3">
                <strong className="text-black">Dispute:</strong>{" "}
                {claim.disputeMessage}
              </div>
            )}
          </div>
        ))
      )}

      {/* Submit Claim Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} closeOnOutsideClick>
          <div className="bg-background p-6 rounded-2xl w-full max-w-2xl space-y-4">
            <h3 className="text-lg font-semibold">Submit Travel Risk Claim</h3>

            <div className="space-y-3">
              <Label>Vehicle Make & Model</Label>
              <Input
                placeholder="e.g. Toyota Corolla"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />

              <Label>Year</Label>
              <Input
                placeholder="e.g. 2017"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />

              <Label>Incident Date</Label>
              <Input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />

              <Label>Country / Region</Label>
              <Input
                placeholder="e.g. South Africa"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />

              <Label>Description</Label>
              <Textarea
                placeholder="Describe the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Label>Estimated Damage Amount</Label>
              <Input
                placeholder="e.g. R40,000"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
              />

              <Button
                className="w-full bg-black text-white hover:bg-gray-900"
                onClick={handleSubmitClaim}
                disabled={!isFormValid}
              >
                Submit for AI Review
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dispute Modal */}
      {activeClaim && (
        <Modal onClose={() => setActiveClaim(null)} closeOnOutsideClick>
          <div className="bg-background p-6 rounded-2xl w-full max-w-xl space-y-4">
            <h3 className="text-lg font-semibold">Dispute Payout Decision</h3>

            <Label>Reason for Dispute</Label>
            <Input
              placeholder="e.g. The payout was too low"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />

            <Label>Additional Comments</Label>
            <Textarea
              placeholder="Explain your reasoning further (optional)..."
              value={disputeComment}
              onChange={(e) => setDisputeComment(e.target.value)}
            />
            <Button
              className="w-full bg-black text-white hover:bg-gray-900 cursor-pointer"
              onClick={handleDispute}
              disabled={!disputeReason.trim() && !disputeComment.trim()}
            >
              Submit Dispute
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
