import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { wrapInTestApp } from '@backstage/test-utils';
import { AppLayout } from './AppLayout';
import { VALUE_STREAM_DASHBOARD_PATH } from './components/value-stream';

jest.mock('./components/Root', () => ({
  Root: ({ children }: { children?: ReactNode }) => (
    <div data-testid="app-root">{children}</div>
  ),
}));

describe('AppLayout', () => {
  it('skips the application chrome on the value stream route', () => {
    render(
      wrapInTestApp(
        <AppLayout>
          <div>dashboard</div>
        </AppLayout>,
        { routeEntries: [VALUE_STREAM_DASHBOARD_PATH] },
      ),
    );

    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('app-root')).not.toBeInTheDocument();
  });

  it('wraps other routes with the application chrome', () => {
    render(
      wrapInTestApp(
        <AppLayout>
          <div>catalog</div>
        </AppLayout>,
        { routeEntries: ['/catalog'] },
      ),
    );

    expect(screen.getByTestId('app-root')).toHaveTextContent('catalog');
  });
});
