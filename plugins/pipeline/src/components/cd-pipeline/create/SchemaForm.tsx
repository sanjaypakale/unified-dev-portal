import { Grid, Typography } from '@material-ui/core';
import { isRequired, matchesCondition } from './conditions';
import { FieldControl } from './FieldControl';
import { useCreatePipelineStyles } from './createPipeline.styles';
import { RemoteSelect } from './RemoteSelect';
import { FieldGroup, SchemaContext } from './schema';

type SchemaFormProps = {
  groups: FieldGroup[];
  values: Record<string, string>;
  context: SchemaContext;
  forceError?: boolean;
  onChange: (key: string, value: string) => void;
};

export const SchemaForm = ({
  groups,
  values,
  context,
  forceError = false,
  onChange,
}: SchemaFormProps) => {
  const classes = useCreatePipelineStyles();

  return (
    <div data-testid="deployment-schema-form">
      {groups.map(group => {
        if (!matchesCondition(group.when, values, context)) {
          return null;
        }
        const fields = group.fields.filter(
          field =>
            field.widget !== 'hidden' &&
            matchesCondition(field.visible, values, context),
        );
        if (fields.length === 0) {
          return null;
        }
        return (
          <div key={group.id} className={classes.section}>
            <Typography className={classes.sectionLabel}>{group.title}</Typography>
            <Grid container spacing={2}>
              {fields.map(field => (
                <Grid item xs={12} sm={6} key={field.key}>
                  {field.optionsSource ? (
                    <RemoteSelect
                      field={field}
                      value={values[field.key] ?? field.defaultValue}
                      required={isRequired(field.required, values, context)}
                      parentValue={
                        field.dependsOn ? values[field.dependsOn] : undefined
                      }
                      forceError={forceError}
                      onChange={next => onChange(field.key, next)}
                    />
                  ) : (
                    <FieldControl
                      field={field}
                      value={values[field.key] ?? field.defaultValue}
                      required={isRequired(field.required, values, context)}
                      forceError={forceError}
                      onChange={next => onChange(field.key, next)}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </div>
        );
      })}
    </div>
  );
};
