export type OnboardingRecord = Record<string, unknown>;

export type OnboardingStore = {
  save(payload: OnboardingRecord): Promise<{ id: number }>;
  list(): Promise<Array<OnboardingRecord & { id: number }>>;
};

type InsertResult = number | number[] | { id?: number };

type OnboardingRow = {
  id: number;
  payload: string;
};

type OnboardingTable = {
  insert(row: { payload: string }): Promise<InsertResult>;
  select(
    idColumn: 'id',
    payloadColumn: 'payload',
  ): {
    orderBy(column: 'id', direction: 'asc'): Promise<OnboardingRow[]>;
  };
};

type OnboardingDatabase = {
  schema: {
    hasTable(name: string): Promise<boolean>;
    createTable(
      name: string,
      builder: (table: {
        increments(column: string): { primary(): void };
        text(column: string): { notNullable(): void };
        timestamp(column: string): { defaultTo(value: unknown): void };
      }) => void,
    ): Promise<void>;
  };
  fn: { now(): unknown };
  (tableName: string): OnboardingTable;
};

/** Stores each onboard submission in the plugin database. */
export const createOnboardingStore = async (
  database: OnboardingDatabase,
): Promise<OnboardingStore> => {
  const tableName = 'pipeline_onboarding';
  const exists = await database.schema.hasTable(tableName);
  if (!exists) {
    await database.schema.createTable(tableName, table => {
      table.increments('id').primary();
      table.text('payload').notNullable();
      table.timestamp('created_at').defaultTo(database.fn.now());
    });
  }

  return {
    async save(payload) {
      const inserted = await database(tableName).insert({
        payload: JSON.stringify(payload),
      });
      const id = Array.isArray(inserted) ? inserted[0] : inserted;
      return { id: Number(id) };
    },
    async list() {
      const rows = await database(tableName)
        .select('id', 'payload')
        .orderBy('id', 'asc');
      return rows.map(row => ({
        id: Number(row.id),
        ...parsePayload(row.payload),
      }));
    },
  };
};

const parsePayload = (payload: string): OnboardingRecord => {
  try {
    const parsed = JSON.parse(payload) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as OnboardingRecord;
    }
  } catch {
    return {};
  }
  return {};
};

/** Keeps onboarded pipelines in memory when a database client is not supplied. */
export const createMemoryOnboardingStore = (): OnboardingStore => {
  const records: Array<OnboardingRecord & { id: number }> = [];
  return {
    async save(payload) {
      const id = records.length + 1;
      records.push({ id, ...payload });
      return { id };
    },
    async list() {
      return records.map(record => ({ ...record }));
    },
  };
};
