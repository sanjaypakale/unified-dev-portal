import { makeStyles } from '@material-ui/core';

export const useCreatePipelineStyles = makeStyles(theme => ({
  flow: {
    maxWidth: 980,
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  stepIconActive: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconUpcoming: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.main}`,
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  stepIconGlyph: {
    fontSize: 16,
  },
  stepTitle: {
    fontWeight: 600,
    fontSize: 16,
  },
  stepTitleUpcoming: {
    fontWeight: 500,
    fontSize: 16,
    color: theme.palette.text.secondary,
  },
  stepBody: {
    marginLeft: 13,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderLeft: `2px solid ${theme.palette.primary.main}`,
  },
  panel: {
    border: `1px solid ${
      theme.palette.type === 'dark' ? theme.palette.grey[700] : '#e5e5e5'
    }`,
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(3),
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
    width: 148,
    minHeight: 124,
    padding: theme.spacing(2, 1.5, 1.5),
    border: `1px solid ${
      theme.palette.type === 'dark' ? theme.palette.grey[700] : '#dedede'
    }`,
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
  },
  cardIcon: {
    fontSize: 34,
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
    borderTop: `28px solid ${theme.palette.primary.main}`,
    borderLeft: '28px solid transparent',
  },
  selectedMarkIcon: {
    position: 'absolute',
    top: 1,
    right: 1,
    fontSize: 13,
    color: theme.palette.primary.contrastText,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
  },
  helper: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  summary: {
    marginBottom: theme.spacing(2),
  },
}));
