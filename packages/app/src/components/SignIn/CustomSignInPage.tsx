import { Button, makeStyles } from '@material-ui/core';
import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef, SignInPageProps } from '@backstage/core-plugin-api';
import { useLocation } from 'react-router-dom';
import {
  VALUE_STREAM_DASHBOARD_PATH,
  ValueStreamDashboard,
} from '../value-stream';

const useStyles = makeStyles(theme => ({
  dashboardButton: {
    position: 'fixed',
    top: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.modal,
  },
}));

export const CustomSignInPage = (props: SignInPageProps) => {
  const classes = useStyles();
  const { pathname } = useLocation();

  if (pathname === VALUE_STREAM_DASHBOARD_PATH) {
    return <ValueStreamDashboard />;
  }

  return (
    <>
      <Button
        className={classes.dashboardButton}
        color="primary"
        variant="contained"
        href={VALUE_STREAM_DASHBOARD_PATH}
        target="_blank"
        rel="noopener noreferrer"
      >
        Value Stream Dashboard
      </Button>
      <SignInPage
        {...props}
        auto
        providers={[
          'guest',
          {
            id: 'github-auth-provider',
            title: 'GitHub',
            message: 'Sign in using GitHub',
            apiRef: githubAuthApiRef,
          },
        ]}
      />
    </>
  );
};
