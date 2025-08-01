"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "../UI/badge";
import { Button } from "../UI/button";
import { Icon } from "../UI/icons/Icon";
import { Input } from "../UI/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../UI/select";
import { InsuredAsset } from "@/types/insure";
import {
  getStatusBadgeVariant,
  getRiskLevelBadgeVariant,
} from "@/utils/badgeVariants";

export const ItemInformationSheet = ({
  asset,
  onClose,
  onSave,
}: {
  asset: InsuredAsset | null;
  onClose: () => void;
  onSave: (updatedAsset: InsuredAsset) => void;
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<InsuredAsset | null>(null);

  // Initialize edited asset when asset changes
  useEffect(() => {
    if (asset) {
      setEditedAsset({ ...asset });
    }
  }, [asset]);

  if (!asset || !editedAsset) return null;

  const handleInputChange = (field: keyof InsuredAsset, value: any) => {
    setEditedAsset((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedAsset);
    setIsEditing(false);
  };

  const handleChatClick = () => {
    router.push(`/chat?policy=${editedAsset.policyNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom sheet container */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-2xl bg-background shadow-xl transition-all duration-300 ease-in-out animate-in slide-in-from-bottom">
        {/* Handle */}
        <div className="flex justify-center p-2">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[80vh] p-6">
          <div className="flex justify-between items-start mb-6">
            {isEditing ? (
              <Input
                value={editedAsset.itemName}
                onChange={(e) => handleInputChange("itemName", e.target.value)}
                className="text-2xl font-bold p-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            ) : (
              <h2 className="text-2xl font-bold">{asset.itemName}</h2>
            )}
            <button onClick={onClose} className="text-muted-foreground">
              <Icon name="XMark" className="h-6 w-6 cursor-pointer" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              {isEditing ? (
                <Select
                  value={editedAsset.status}
                  onValueChange={(value) =>
                    handleInputChange("status", value as InsuredAsset["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={getStatusBadgeVariant(asset.status)}>
                  {asset.status}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
              {isEditing ? (
                <Select
                  value={editedAsset.riskLevel}
                  onValueChange={(value) =>
                    handleInputChange(
                      "riskLevel",
                      value as InsuredAsset["riskLevel"]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={getRiskLevelBadgeVariant(asset.riskLevel)}>
                  {asset.riskLevel}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              {isEditing ? (
                <Input
                  value={editedAsset.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{asset.category}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policy Number</p>
              {isEditing ? (
                <Input
                  value={editedAsset.policyNumber || ""}
                  onChange={(e) =>
                    handleInputChange("policyNumber", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{asset.policyNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              {isEditing ? (
                <Input
                  value={editedAsset.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{asset.description}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedAsset.monthlyPayment}
                    onChange={(e) =>
                      handleInputChange(
                        "monthlyPayment",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                ) : (
                  <p className="font-medium">
                    R{asset.monthlyPayment.toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coverage Amount</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedAsset.coverageAmount || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "coverageAmount",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                ) : (
                  <p className="font-medium">
                    R{asset.coverageAmount?.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deductible</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedAsset.deductible || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "deductible",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                ) : (
                  <p className="font-medium">
                    R{asset.deductible?.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date Added</p>
              <p className="font-medium">
                {new Date(asset.dateAdded).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Icon name="Edit" className="mr-2 h-4 w-4" isLottie />
                  Edit Policy
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleChatClick}
                >
                  <Icon
                    name="ChatBubbleBottomCenter"
                    className="mr-2 h-4 w-4"
                  />
                  Contact Agent
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
