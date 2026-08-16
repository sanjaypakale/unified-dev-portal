import { ValueStreamMenuItem } from './types';

export const KIBANA_LEAD_TIME = 'https://kibana.example.com/lead-time';
export const KIBANA_PROD = 'https://kibana.example.com/cfr-prod';
export const KIBANA_STAGING = 'https://kibana.example.com/cfr-staging';
export const DOCS_URL = 'https://www.elastic.co/guide';

export const menuItems: ValueStreamMenuItem[] = [
  {
    displayName: 'Lead time',
    url: KIBANA_LEAD_TIME,
    isIframeUrl: true,
  },
  {
    displayName: 'Delivery',
    children: [
      {
        displayName: 'Change failure rate',
        children: [
          {
            displayName: 'Production',
            url: KIBANA_PROD,
            isIframeUrl: true,
          },
          {
            displayName: 'Staging',
            url: KIBANA_STAGING,
            isIframeUrl: true,
          },
        ],
      },
    ],
  },
  {
    displayName: 'Documentation',
    url: DOCS_URL,
    isIframeUrl: false,
  },
  {
    displayName: 'Empty',
  },
];
