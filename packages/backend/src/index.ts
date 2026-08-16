/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';
import { authProvidersExtensionPoint, createOAuthProviderFactory } from '@backstage/plugin-auth-node';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

backend.add(import('@backstage/plugin-catalog-backend-module-github'));

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
// backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

backend.add(import('@backstage-community/plugin-scaffolder-backend-module-jenkins'));
// const customAuth = createBackendModule({
//   // This ID must be exactly "auth" because that's the plugin it targets
//   pluginId: 'auth',
//   // This ID must be unique, but can be anything
//   moduleId: 'custom-auth-provider',
//   register(reg) {
//     reg.registerInit({
//       deps: { providers: authProvidersExtensionPoint },
//       async init({ providers }) {
//         providers.registerProvider({
//           // This ID must match the actual provider config, e.g. addressing
//           // auth.providers.github means that this must be "github".
//           providerId: 'github',
//           // Use createProxyAuthProviderFactory instead if it's one of the proxy
//           // based providers rather than an OAuth based one
//           factory: createOAuthProviderFactory({
//             authenticator: githubAuthenticator,
//             async signInResolver(info, ctx) {
//               // Match GitHub username to catalog user entity name (from result.fullProfile)
//               const username =
//                 (info.result as { fullProfile?: { username?: string } })
//                   .fullProfile?.username;
//               if (!username) {
//                 throw new Error('GitHub profile contained no username');
//               }
//               return ctx.signInWithCatalogUser({
//                 entityRef: { name: username },
//               });
//             },
//           }),
//         });
//       },
//     });
//   },
// });
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
//backend.add(customAuth);
backend.start();
