import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import { createServer, get } from 'http';
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
});
