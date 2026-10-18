export interface Config {
  /**
   * Deployment pipeline wizard settings.
   * @visibility frontend
   */
  pipelines?: {
    /**
     * Cloud providers offered under OpenShift Container > Cloud.
     * @visibility frontend
     */
    cloudProviders?: Array<{
      /**
       * Route id, for example aws.
       * @visibility frontend
       */
      id: string;
      /**
       * Card label.
       * @visibility frontend
       */
      title: string;
      /**
       * Icon key: aws, azure, gcp, or cloud.
       * @visibility frontend
       */
      icon?: string;
      /**
       * Optional supporting text on the card.
       * @visibility frontend
       */
      description?: string;
      /**
       * Value stored as the pipeline deployment type.
       * @visibility frontend
       */
      deploymentType?: string;
    }>;
  };
}
