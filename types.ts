export type ModuleKey =
  | "Dashboard" | "CRM" | "Sales & Quotes" | "Projects" | "Inventory"
  | "Procurement" | "Finance" | "Service & AMC" | "HR & Workforce" | "Reports" | "Admin";

export type RecordItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  amount?: number;
  owner?: string;
  date?: string;
};

export type TableConfig = {
  table: string;
  title: string;
  fields: { key: string; label: string; type?: string; required?: boolean; options?: string[] }[];
};