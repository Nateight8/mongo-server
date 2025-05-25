import session from 'express-session';
import { Pool } from 'pg';

declare module 'express-session' {
  interface SessionData {
    // Add any custom session properties here
    [key: string]: any;
  }
}

declare function pgConnect(session: typeof session): (options: {
  pool: Pool;
  tableName?: string;
  schemaName?: string;
  pruneSessionInterval?: number | false;
  pruneSessionRandomizedInterval?: boolean;
  ttl?: number;
  disableTouch?: boolean;
  createTableIfMissing?: boolean;
}) => session.Store;

export = pgConnect;
