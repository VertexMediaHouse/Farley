export interface CatalogProduct {
  name: string;
  url: string;
  image?: string;
}

export interface CatalogCategory {
  size: string;
  products: CatalogProduct[];
}

export interface Condition {
  field: string;
  /** Show when field === value */
  is?: string;
  /** Show when field !== value */
  not?: string;
  /** Show when field is not "No" (not empty and not "No") */
  notNo?: boolean;
  /** Show when field value is one of these */
  in?: string[];
  /** Show when field value is NOT one of these */
  notIn?: string[];
}

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'photoUpload'
  | 'catalogDropdown'
  | 'notice'
  | 'section'
  | 'repeatableGroup';

export interface QuestionConfig {
  id: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  condition?: Condition;
  helpText?: string;
  placeholder?: string;
  multiple?: boolean;
  catalog?: CatalogCategory[];
  noticeText?: string;
  /** Sub-questions rendered after this question (same level, not nested) */
  children?: QuestionConfig[];
}

export type AreaValues = Record<string, string | string[] | File[] | Record<string, any>[] | null>;
