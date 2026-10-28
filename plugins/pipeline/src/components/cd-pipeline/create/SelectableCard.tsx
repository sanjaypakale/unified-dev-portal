import { Typography } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import { useCreatePipelineStyles } from './createPipeline.styles';
import { OptionIcon } from './optionIcons';
import { WizardOption } from './wizardOptions';

type SelectableCardProps = {
  option: WizardOption;
  selected: boolean;
  onSelect: (id: string) => void;
};

export const SelectableCard = ({
  option,
  selected,
  onSelect,
}: SelectableCardProps) => {
  const classes = useCreatePipelineStyles();
  const className = selected
    ? `${classes.card} ${classes.cardSelected}`
    : classes.card;

  return (
    <button
      type="button"
      className={className}
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
    >
      {selected && (
        <span className={classes.selectedMark}>
          <CheckIcon className={classes.selectedMarkIcon} />
        </span>
      )}
      <OptionIcon name={option.icon} className={classes.cardIcon} />
      <Typography variant="body2" className={classes.cardTitle}>
        {option.title}
      </Typography>
    </button>
  );
};
