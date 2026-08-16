import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { Root } from './components/Root';
import { VALUE_STREAM_DASHBOARD_PATH } from './components/value-stream';

export const AppLayout = ({ children }: PropsWithChildren<{}>) => {
  const { pathname } = useLocation();
  if (pathname === VALUE_STREAM_DASHBOARD_PATH) {
    return <>{children}</>;
  }
  return <Root>{children}</Root>;
};
