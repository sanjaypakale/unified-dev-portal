export type Condition =
  | { field: string; equals: string }
  | { context: 'platform' | 'cloudProvider'; equals: string }
  | { all: Condition[] }
  | { any: Condition[] };

export type FieldOption = {
  label: string;
  value: string;
};

export type DeploymentField = {
  key: string;
  label?: string;
  widget: 'text' | 'select' | 'boolean' | 'hidden';
  required?: boolean | Condition;
  visible?: Condition;
  defaultValue?: string;
  options?: FieldOption[];
  errorMessage?: string;
  write?: boolean;
};

export type FieldGroup = {
  id: string;
  title: string;
  when?: Condition;
  fields: DeploymentField[];
};

export type DeploymentSchema = {
  id: string;
  groups: FieldGroup[];
};

export type SchemaContext = {
  platform?: string;
  cloudProvider?: string;
};
