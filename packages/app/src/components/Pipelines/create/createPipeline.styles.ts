import { makeStyles } from '@material-ui/core';

export const useCreatePipelineStyles = makeStyles(theme => ({
  stepper: {
    maxWidth: 920,
    padding: 0,
    background: 'transparent',
  },
  sectionLabel: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  cardRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  card: {
    position: 'relative',
    width: 156,
    minHeight: 132,
    padding: theme.spacing(2, 1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    font: 'inherit',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&:focus': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  cardSelected: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.type === 'dark' ? '#13293d' : '#e8f4fd',
    boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
  },
  cardIcon: {
    fontSize: 36,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  cardTitle: {
    fontWeight: 500,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  selectedMark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTop: `32px solid ${theme.palette.primary.main}`,
    borderLeft: '32px solid transparent',
  },
  selectedMarkIcon: {
    position: 'absolute',
    top: 1,
    right: 1,
    fontSize: 14,
    color: theme.palette.primary.contrastText,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2.5),
  },
  helper: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  summary: {
    marginBottom: theme.spacing(2),
  },
}));
