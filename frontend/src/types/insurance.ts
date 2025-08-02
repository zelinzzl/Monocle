export interface InsuranceAsset {
    id: string
    user_id: string
    created_at: string
    updated_at: string
    item_name: string
    category: string
    monthly_payment: number
    date_added: string
    risk_level: "Low" | "Medium" | "High"
    status: "Active" | "Pending" | "Expired" | "Cancelled"
    make: string
    model: string
    year: number
    policy_number: string
    description: string
    coverage_amount: number
    main_driver_age: number
    risk_score: number
  }
  
  export interface NewAssetForm {
    item_name: string
    category: string
    make: string
    model: string
    year: number
    policy_number: string
    description: string
    main_driver_age: number
  }
  