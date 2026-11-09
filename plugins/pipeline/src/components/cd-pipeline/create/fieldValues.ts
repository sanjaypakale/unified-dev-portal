import { FieldGroup } from './schema';

/** Updates one answer and clears selects that depend on it. */
export const applyFieldChange = (
  values: Record<string, string>,
  groups: FieldGroup[],
  key: string,
  value: string,
): Record<string, string> => {
  if (values[key] === value) {
    return values;
  }
  const next = { ...values, [key]: value };
  groups.forEach(group => {
    group.fields.forEach(field => {
      if (field.dependsOn === key) {
        next[field.key] = '';
      }
    });
  });
  return next;
};
