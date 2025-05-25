declare module 'connect-pg-simple' {
  import { Store, SessionData } from 'express-session';
  import { Pool, PoolConfig } from 'pg';

  function pgSession(options?: {
    pool?: Pool;
    pgPromise?: any;
    tableName?: string;
    schemaName?: string;
    pruneSessionInterval?: number | false;
    pruneSessionRandomizedInterval?: boolean;
    ttl?: number;
    disableTouch?: boolean;
    createTableIfMissing?: boolean;
    errorLog?: (message: string, error: Error) => void;
  }): (session: any) => new () => Store & {
    pruneSessions(): Promise<void>;
  };

  export = pgSession;
}
