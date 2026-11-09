import { useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@material-ui/core';
import { DeploymentField } from './schema';

type FieldControlProps = {
  field: DeploymentField;
  value?: string;
  required: boolean;
  disabled?: boolean;
  helperText?: string;
  forceError?: boolean;
  onChange: (value: string) => void;
};

export const FieldControl = ({
  field,
  value,
  required,
  disabled = false,
  helperText,
  forceError = false,
  onChange,
}: FieldControlProps) => {
  const [touched, setTouched] = useState(false);
  const current = value ?? field.defaultValue ?? '';
  const patternError =
    current.trim() && field.pattern && !new RegExp(field.pattern, 'i').test(current.trim())
      ? field.patternMessage || 'Invalid value'
      : undefined;
  const requiredError = required && !current.trim();
  const showError = (touched || forceError) && (requiredError || Boolean(patternError));
  const errorText = requiredError
    ? field.errorMessage || `${field.label || field.key} is required`
    : patternError;

  if (field.widget === 'hidden') {
    return null;
  }

  if (field.widget === 'boolean') {
    return (
      <FormControl component="fieldset" required={required} error={showError}>
        <FormLabel component="legend">{field.label}</FormLabel>
        <RadioGroup
          row
          aria-label={field.label}
          value={current}
          onChange={event => onChange(event.target.value)}
          onBlur={() => setTouched(true)}
        >
          {(field.options ?? []).map(option => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio color="primary" />}
              label={option.label}
            />
          ))}
        </RadioGroup>
        {showError && <FormHelperText>{errorText}</FormHelperText>}
      </FormControl>
    );
  }

  if (field.widget === 'select') {
    return (
      <FormControl
        fullWidth
        required={required}
        error={showError}
        disabled={disabled}
        variant="outlined"
        size="small"
      >
        <InputLabel id={`${field.key}-label`}>{field.label}</InputLabel>
        <Select
          labelId={`${field.key}-label`}
          id={field.key}
          label={required ? `${field.label}\u00a0*` : field.label}
          value={current}
          disabled={disabled}
          onChange={event => onChange(String(event.target.value))}
          onBlur={() => setTouched(true)}
        >
          {(field.options ?? []).map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {(showError || helperText) && (
          <FormHelperText>{showError ? errorText : helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  return (
    <TextField
      id={field.key}
      fullWidth
      label={field.label}
      required={required}
      value={value ?? ''}
      variant="outlined"
      size='small'
      error={showError}
      helperText={showError ? errorText : helperText || field.helperText}
      onChange={event => onChange(event.target.value)}
      onBlur={() => setTouched(true)}
    />
  );
};
