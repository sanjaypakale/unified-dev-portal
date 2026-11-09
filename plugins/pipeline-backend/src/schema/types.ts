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
  pattern?: string;
  patternMessage?: string;
  helperText?: string;
  write?: boolean;
  optionsSource?: 'bitbucket-projects' | 'bitbucket-repositories';
  dependsOn?: string;
  output?: {
    map?: Record<string, string>;
    template?: string;
    constant?: string;
    fromContext?: string;
    when?: Condition;
  };
};

export type FieldGroup = {
  id: string;
  title: string;
  step?: 'repository' | 'deployment' | 'cloud';
  when?: Condition;
  fields: DeploymentField[];
};

export type DeploymentSchema = {
  id: string;
  groups: FieldGroup[];
};
