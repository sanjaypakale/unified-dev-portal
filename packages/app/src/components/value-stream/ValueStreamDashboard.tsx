import { useEffect, useState } from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { Progress } from '@backstage/core-components';
import { ValueStreamMenu } from './ValueStreamMenu';
import { fetchDashboardMenu } from './fetchDashboardMenu';
import { IFRAME_NAME, ValueStreamMenuItem } from './types';

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
  error: {
    padding: theme.spacing(2, 2.5),
    color: theme.palette.error.main,
  },
}));

export const VALUE_STREAM_DASHBOARD_PATH = '/value-stream-dashboard';

export const ValueStreamDashboard = () => {
  const classes = useStyles();
  const [items, setItems] = useState<ValueStreamMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [iframeUrl, setIframeUrl] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    const loadMenu = async () => {
      try {
        const menu = await fetchDashboardMenu();
        if (!cancelled) {
          setItems(menu);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load dashboard menu',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={classes.root}>
      {loading ? (
        <Progress />
      ) : (
        <ValueStreamMenu
          title="Value Stream Dashboard"
          items={items}
          activeUrl={iframeUrl}
          onIframeSelect={setIframeUrl}
        />
      )}
      {error && (
        <Typography className={classes.error} variant="body2">
          {error}
        </Typography>
      )}
      {iframeUrl ? (
        <iframe
          className={classes.iframe}
          name={IFRAME_NAME}
          title="ELK dashboard"
          src={iframeUrl}
        />
      ) : (
        !loading &&
        !error && (
          <div className={classes.placeholder}>
            <Typography variant="h6" className={classes.placeholderTitle}>
              Select a dashboard
            </Typography>
            <Typography variant="body2">
              Choose a Kibana report from the menu to load it in this view.
            </Typography>
          </div>
        )
      )}
    </div>
  );
};
