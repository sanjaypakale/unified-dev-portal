import { RootConfigService } from '@backstage/backend-plugin-api';

export class BitbucketConfigError extends Error {
  constructor() {
    super('integrations.bitbucketServer is not configured');
    this.name = 'BitbucketConfigError';
  }
}

export type BitbucketServer = {
  apiBaseUrl: string;
  headers: Record<string, string>;
};

export const readBitbucketServer = (
  config: RootConfigService,
): BitbucketServer | undefined => {
  const server = config.getOptionalConfigArray('integrations.bitbucketServer')?.[0];
  if (!server) {
    return undefined;
  }
  const host = server.getString('host');
  const apiBaseUrl = (
    server.getOptionalString('apiBaseUrl') ?? `https://${host}/rest/api/1.0`
  ).replace(/\/$/, '');
  const token = server.getOptionalString('token');
  const username = server.getOptionalString('username');
  const password = server.getOptionalString('password');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }
  return { apiBaseUrl, headers };
};

export const requireBitbucketServer = (config: RootConfigService): BitbucketServer => {
  const server = readBitbucketServer(config);
  if (!server) {
    throw new BitbucketConfigError();
  }
  return server;
};

type BitbucketPage<T> = {
  values?: T[];
  isLastPage?: boolean;
  nextPageStart?: number;
};

/** Reads every page of a Bitbucket Server collection. */
export const readBitbucketPages = async <T>(
  server: BitbucketServer,
  path: string,
): Promise<T[]> => {
  const collected: T[] = [];
  let start: number | undefined;
  for (let page = 0; page < 50; page += 1) {
    const joiner = path.includes('?') ? '&' : '?';
    const suffix = start === undefined ? '' : `${joiner}start=${start}`;
    const response = await fetch(`${server.apiBaseUrl}${path}${suffix}`, {
      headers: server.headers,
    });
    if (!response.ok) {
      throw new Error(`Bitbucket request failed (${response.status})`);
    }
    const body = (await response.json()) as BitbucketPage<T>;
    collected.push(...(body.values ?? []));
    if (body.isLastPage !== false || body.nextPageStart === undefined) {
      break;
    }
    start = body.nextPageStart;
  }
  return collected;
};

export const readBitbucketText = async (
  server: BitbucketServer,
  project: string,
  repository: string,
  path: string,
): Promise<string> => {
  const url = `${server.apiBaseUrl}/projects/${encodeURIComponent(project)}/repos/${encodeURIComponent(repository)}/raw/${path}`;
  const response = await fetch(url, { headers: server.headers });
  if (!response.ok) {
    throw new Error(
      `Failed to read ${path} from ${project}/${repository} (${response.status})`,
    );
  }
  return response.text();
};

export const readBitbucketJson = async (
  server: BitbucketServer,
  project: string,
  repository: string,
  path: string,
): Promise<unknown> => JSON.parse(await readBitbucketText(server, project, repository, path));
