import { BitbucketServer, readBitbucketPages } from './bitbucketServer';

export type BitbucketProject = {
  key: string;
  name: string;
};

export type BitbucketRepository = {
  name: string;
};

export type BitbucketCatalog = {
  listProjects(): Promise<BitbucketProject[]>;
  listRepositories(projectKey: string): Promise<BitbucketRepository[]>;
};

type ProjectRecord = { key?: string; name?: string };
type RepositoryRecord = { name?: string; slug?: string };

/** Lists projects and repositories from the configured Bitbucket Server. */
export const createBitbucketCatalog = (server: BitbucketServer): BitbucketCatalog => ({
  async listProjects() {
    const projects = await readBitbucketPages<ProjectRecord>(
      server,
      '/projects?limit=100',
    );
    return projects.flatMap(project =>
      project.key && project.name ? [{ key: project.key, name: project.name }] : [],
    );
  },

  async listRepositories(projectKey) {
    const repositories = await readBitbucketPages<RepositoryRecord>(
      server,
      `/projects/${encodeURIComponent(projectKey)}/repos?limit=100`,
    );
    return repositories.flatMap(repository => {
      const name = repository.name || repository.slug;
      return name ? [{ name }] : [];
    });
  },
});
