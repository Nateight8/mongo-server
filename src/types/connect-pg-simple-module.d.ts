// Type definitions for connect-pg-simple

declare module 'connect-pg-simple' {
  import { Pool } from 'pg';
  import session from 'express-session';

  function pgSession(session: any): new (options: {
    pool: Pool;
    tableName?: string;
    schemaName?: string;
    pruneSessionInterval?: number | false;
    pruneSessionRandomizedInterval?: boolean;
    ttl?: number;
    disableTouch?: boolean;
    createTableIfMissing?: boolean;
  }) => session.Store & {
    pruneSessions(): Promise<void>;
  };

  export = pgSession;
}
