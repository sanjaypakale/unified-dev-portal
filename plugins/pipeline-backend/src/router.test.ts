import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import { createServer, get, request } from 'http';
import { AddressInfo } from 'net';
import { createRouter } from './router';

const logger = {
  info: jest.fn(),
} as unknown as LoggerService;

describe('createRouter', () => {
  it('returns ok from the health route', async () => {
    const app = express();
    app.use(await createRouter({ logger }));
    const server = createServer(app);
    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', resolve);
    });

    const { port } = server.address() as AddressInfo;
    const body = await new Promise<string>((resolve, reject) => {
      get(`http://127.0.0.1:${port}/health`, response => {
        let data = '';
        response.on('data', chunk => {
          data += chunk;
        });
        response.on('end', () => resolve(data));
      }).on('error', reject);
    });

    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });

    expect(JSON.parse(body)).toEqual({ status: 'ok' });
  });

  it('returns the deployment schema and the helm properties path', async () => {
    const app = express();
    app.use(await createRouter({ logger }));
    const server = createServer(app);
    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', resolve);
    });

    const { port } = server.address() as AddressInfo;
    const body = await new Promise<string>((resolve, reject) => {
      get(`http://127.0.0.1:${port}/schemas?method=helm`, response => {
        let data = '';
        response.on('data', chunk => {
          data += chunk;
        });
        response.on('end', () => resolve(data));
      }).on('error', reject);
    });

    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });

    const schema = JSON.parse(body);
    const fields = schema.groups.flatMap(
      (group: { fields: Array<{ key: string; output?: { constant?: string } }> }) =>
        group.fields,
    );
    expect(fields.some((field: { key: string }) => field.key === 'SIT_OC_URL')).toBe(
      true,
    );
    expect(
      fields.find((field: { key: string }) => field.key === 'MODULE_PROPS_FILE_PATH')
        ?.output?.constant,
    ).toBe('Chart.yaml');
  });

  it('lists repositories for the selected Bitbucket project', async () => {
    const app = express();
    app.use(await createRouter({ logger }));
    const server = createServer(app);
    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', resolve);
    });

    const { port } = server.address() as AddressInfo;
    const read = (path: string) =>
      new Promise<string>((resolve, reject) => {
        get(`http://127.0.0.1:${port}${path}`, response => {
          let data = '';
          response.on('data', chunk => {
            data += chunk;
          });
          response.on('end', () => resolve(data));
        }).on('error', reject);
      });

    const projects = JSON.parse(await read('/bitbucket/projects'));
    const repositories = JSON.parse(
      await read('/bitbucket/projects/PAY/repositories'),
    );

    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });

    expect(projects).toEqual(
      expect.arrayContaining([{ key: 'PAY', name: 'PAY' }]),
    );
    expect(repositories).toEqual(
      expect.arrayContaining([{ name: 'payments-service' }]),
    );
  });

  it('accepts an onboard submission and adds only the selected cloud fields', async () => {
    const app = express();
    app.use(await createRouter({ logger }));
    const server = createServer(app);
    await new Promise<void>(resolve => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address() as AddressInfo;

    const read = (path: string) =>
      new Promise<string>((resolve, reject) => {
        get(`http://127.0.0.1:${port}${path}`, response => {
          let data = '';
          response.on('data', chunk => {
            data += chunk;
          });
          response.on('end', () => resolve(data));
        }).on('error', reject);
      });

    const post = (path: string, payload: unknown) =>
      new Promise<{ status: number; body: string }>((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(data),
            },
          },
          response => {
            let body = '';
            response.on('data', chunk => {
              body += chunk;
            });
            response.on('end', () =>
              resolve({ status: response.statusCode ?? 0, body }),
            );
          },
        );
        req.on('error', reject);
        req.write(data);
        req.end();
      });

    const schema = JSON.parse(await read('/schemas?cloudProvider=aws'));
    const saved = await post('/onboard', {
      appCode: 'PAY',
      targetId: 'container-service',
      platformId: 'openshift',
      typeId: 'kustomize',
      values: {
        APP_CODE: 'PAY',
        BITBUCKET_PROJECT_NAME: 'PAY',
        MODULE_NAME: 'payments-service',
        NOTIFICATION_EMAIL: 'person@uobgroup.com',
      },
    });
    const pipelines = JSON.parse(await read('/pipelines'));

    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });

    const keys = schema.groups.flatMap(
      (group: { fields: Array<{ key: string }> }) =>
        group.fields.map(field => field.key),
    );
    expect(keys).toContain('AWS_ACCOUNT_ID');
    expect(keys).not.toContain('AZURE_SUBSCRIPTION_ID');
    expect(saved.status).toBe(201);
    expect(JSON.parse(saved.body).status).toBe('accepted');
    expect(pipelines).toEqual([
      expect.objectContaining({
        id: 1,
        typeId: 'kustomize',
        values: expect.objectContaining({
          BITBUCKET_PROJECT_NAME: 'PAY',
          MODULE_NAME: 'payments-service',
        }),
      }),
    ]);
  });
});
