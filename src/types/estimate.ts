export interface EstimateLineItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface EstimateResult {
  labor: EstimateLineItem[];
  materials: EstimateLineItem[];
  additionalCharges: EstimateLineItem[];
  subtotalLabor: number;
  subtotalMaterials: number;
  subtotalAdditional: number;
  baseServiceFee: number;
  grandTotal: number;
  isPendingReview: boolean;
  reviewStatus: 'Calculated' | 'Pending Final Review';
  followUpQuestions: string[];
  requiresPhotos: boolean;
}

