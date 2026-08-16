import { useState } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { ValueStreamMenu } from './ValueStreamMenu';
import { DUMMY_VALUE_STREAM_MENU } from './dummyMenu';
import { IFRAME_NAME } from './types';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  iframe: {
    flex: 1,
    width: '100%',
    border: 0,
    backgroundColor: theme.palette.background.paper,
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    padding: theme.spacing(4),
    background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  },
  placeholderTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

export const VALUE_STREAM_DASHBOARD_PATH = '/value-stream-dashboard';

export const ValueStreamDashboard = () => {
  const classes = useStyles();
  const [iframeUrl, setIframeUrl] = useState<string>();

  return (
    <div className={classes.root}>
      <ValueStreamMenu
        title="Value Stream Dashboard"
        items={DUMMY_VALUE_STREAM_MENU}
        activeUrl={iframeUrl}
        onIframeSelect={setIframeUrl}
      />
      {iframeUrl ? (
        <iframe
          className={classes.iframe}
          name={IFRAME_NAME}
          title="ELK dashboard"
          src={iframeUrl}
        />
      ) : (
        <div className={classes.placeholder}>
          <Typography variant="h6" className={classes.placeholderTitle}>
            Select a dashboard
          </Typography>
          <Typography variant="body2">
            Choose a Kibana report from the menu to load it in this view.
          </Typography>
        </div>
      )}
    </div>
  );
};
