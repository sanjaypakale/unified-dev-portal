import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
    padding: theme.spacing(6, 3),
    textAlign: 'center',
  },
  title: {
    marginTop: theme.spacing(3),
    fontWeight: 600,
  },
  description: {
    marginTop: theme.spacing(1),
    maxWidth: 480,
  },
}));

const PipelinesEmptyIllustration = () => (
  <svg
    width="280"
    height="180"
    viewBox="0 0 280 180"
    role="img"
    aria-label="No pipelines"
  >
    <rect x="24" y="48" width="72" height="52" rx="6" fill="none" stroke="#5c6bc0" strokeWidth="2" />
    <rect x="36" y="62" width="48" height="8" rx="2" fill="#c5cae9" />
    <rect x="36" y="76" width="32" height="8" rx="2" fill="#e8eaf6" />
    <path
      d="M96 74 H132"
      fill="none"
      stroke="#90a4ae"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <rect x="132" y="36" width="88" height="76" rx="6" fill="none" stroke="#1565c0" strokeWidth="2" />
    <rect x="146" y="52" width="60" height="8" rx="2" fill="#bbdefb" />
    <rect x="146" y="68" width="44" height="8" rx="2" fill="#e3f2fd" />
    <rect x="146" y="84" width="52" height="8" rx="2" fill="#e3f2fd" />
    <path
      d="M220 74 H248"
      fill="none"
      stroke="#90a4ae"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <circle cx="256" cy="74" r="10" fill="none" stroke="#2e7d32" strokeWidth="2" />
    <path d="M252 74 l3 3 l6 -7" fill="none" stroke="#2e7d32" strokeWidth="2" />
  </svg>
);

export const PipelinesEmptyState = () => {
  const classes = useStyles();

  return (
    <div className={classes.root} data-testid="pipelines-empty-state">
      <PipelinesEmptyIllustration />
      <Typography variant="h5" className={classes.title}>
        No pipelines
      </Typography>
      <Typography variant="body1" color="textSecondary" className={classes.description}>
        Pipelines define your release process using multiple steps and approvals
        in sequential and/or parallel stages.
      </Typography>
    </div>
  );
};
