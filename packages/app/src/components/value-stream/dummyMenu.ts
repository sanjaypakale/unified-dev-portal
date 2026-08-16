import { ValueStreamMenuItem } from './types';

// Replace urls with real Kibana embed links (add ?embed=true). isIframeUrl loads the iframe.
export const DUMMY_VALUE_STREAM_MENU: ValueStreamMenuItem[] = [
  {
    displayName: 'Delivery',
    children: [
      {
        displayName: 'Lead time',
        url: 'https://kibana.example.com/app/dashboards#/view/lead-time?embed=true',
        isIframeUrl: true,
      },
      {
        displayName: 'Deployment frequency',
        url: 'https://kibana.example.com/app/dashboards#/view/deploy-frequency?embed=true',
        isIframeUrl: true,
      },
      {
        displayName: 'Change failure rate',
        children: [
          {
            displayName: 'Production',
            url: 'https://kibana.example.com/app/dashboards#/view/cfr-prod?embed=true',
            isIframeUrl: true,
          },
          {
            displayName: 'Staging',
            url: 'https://kibana.example.com/app/dashboards#/view/cfr-staging?embed=true',
            isIframeUrl: true,
          },
        ],
      },
    ],
  },
  {
    displayName: 'Reliability',
    children: [
      {
        displayName: 'MTTR',
        url: 'https://kibana.example.com/app/dashboards#/view/mttr?embed=true',
        isIframeUrl: true,
      },
      {
        displayName: 'Incidents',
        url: 'https://kibana.example.com/app/dashboards#/view/incidents?embed=true',
        isIframeUrl: true,
      },
    ],
  },
  {
    displayName: 'Documentation',
    url: 'https://www.elastic.co/guide/en/kibana/current/dashboard.html',
    isIframeUrl: false,
  },
];
