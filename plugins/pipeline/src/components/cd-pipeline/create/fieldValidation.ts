import { isRequired, matchesCondition } from './conditions';
import { DeploymentField, FieldGroup, SchemaContext } from './schema';

/** Returns the message that blocks Next for one field. */
export const fieldError = (
  field: DeploymentField,
  value: string | undefined,
  values: Record<string, string>,
  context: SchemaContext,
): string | undefined => {
  if (field.widget === 'hidden') {
    return undefined;
  }
  if (!matchesCondition(field.visible, values, context)) {
    return undefined;
  }
  const current = (value ?? '').trim();
  if (isRequired(field.required, values, context) && !current) {
    return field.errorMessage || `${field.label || field.key} is required`;
  }
  if (current && field.pattern && !new RegExp(field.pattern, 'i').test(current)) {
    return field.patternMessage || 'Invalid value';
  }
  return undefined;
};

/** Collects blocking messages for the groups on the current step. */
export const stepErrors = (
  groups: FieldGroup[],
  values: Record<string, string>,
  context: SchemaContext,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  groups.forEach(group => {
    if (!matchesCondition(group.when, values, context)) {
      return;
    }
    group.fields.forEach(field => {
      const message = fieldError(
        field,
        values[field.key] ?? field.defaultValue,
        values,
        context,
      );
      if (message) {
        errors[field.key] = message;
      }
    });
  });
  return errors;
};
