export type LensTag = "MEGA" | "MACRO" | "MICRO";

export type PageKey =
  | "dashboard"
  | "bibliography"
  | "pop"
  | "lit-review"
  | "conceptual-framework"
  | "methods"
  | "data-evidence"
  | "stakeholders"
  | "writing-studio"
  | "timeline"
  | "tasks"
  | "meetings"
  | "exports";

export type DbPage = {
  id: string;
  key: PageKey;
  title: string;
  content_json: any;
  updated_at: string;
};

export type Tag = {
  id: string;
  label: string;
  kind: "lens" | "custom";
};
