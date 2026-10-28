import { Condition, SchemaContext } from './schema';

export const matchesCondition = (
  condition: Condition | boolean | undefined,
  values: Record<string, string>,
  context: SchemaContext,
): boolean => {
  if (condition === undefined) {
    return true;
  }
  if (typeof condition === 'boolean') {
    return condition;
  }
  if ('all' in condition) {
    return condition.all.every(item => matchesCondition(item, values, context));
  }
  if ('any' in condition) {
    return condition.any.some(item => matchesCondition(item, values, context));
  }
  if ('context' in condition) {
    const actual =
      condition.context === 'platform' ? context.platform : context.cloudProvider;
    return actual === condition.equals;
  }
  return values[condition.field] === condition.equals;
};

export const isRequired = (
  required: boolean | Condition | undefined,
  values: Record<string, string>,
  context: SchemaContext,
) => {
  if (required === undefined || required === false) {
    return false;
  }
  return matchesCondition(required, values, context);
};
