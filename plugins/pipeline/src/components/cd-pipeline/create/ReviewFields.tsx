import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { matchesCondition } from './conditions';
import { useCreatePipelineStyles } from './createPipeline.styles';
import { DeploymentField, FieldGroup, SchemaContext } from './schema';

const displayValue = (field: DeploymentField, value?: string) => {
  if (!value) {
    return '—';
  }
  return field.options?.find(option => option.value === value)?.label ?? value;
};

type ReviewFieldsProps = {
  groups: FieldGroup[];
  values: Record<string, string>;
  context: SchemaContext;
};

/** Read-only accordion of every answered group. */
export const ReviewFields = ({ groups, values, context }: ReviewFieldsProps) => {
  const classes = useCreatePipelineStyles();
  const visibleGroups = groups.filter(group => {
    if (!matchesCondition(group.when, values, context)) {
      return false;
    }
    return group.fields.some(
      field =>
        field.widget !== 'hidden' &&
        matchesCondition(field.visible, values, context),
    );
  });

  return (
    <div>
      {visibleGroups.map(group => (
        <Accordion key={group.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.sectionLabel}>{group.title}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.reviewDetails}>
            <Grid container spacing={2}>
              {group.fields
                .filter(
                  field =>
                    field.widget !== 'hidden' &&
                    matchesCondition(field.visible, values, context),
                )
                .map(field => (
                  <Grid item xs={12} sm={6} key={field.key}>
                    <Typography variant="caption" color="textSecondary">
                      {field.label || field.key}
                    </Typography>
                    <Typography>
                      {displayValue(field, values[field.key] ?? field.defaultValue)}
                    </Typography>
                  </Grid>
                ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
