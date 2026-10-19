export interface Config {
  /**
   * Deployment pipeline wizard settings.
   * @visibility frontend
   */
  pipelines?: {
    /**
     * Comma-separated cloud providers, for example AWS, AZURE, GCP.
     * @visibility frontend
     */
    cloudProviders?: string;
  };
}
