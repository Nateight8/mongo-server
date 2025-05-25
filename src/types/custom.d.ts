import { Pool } from 'pg';
import session from 'express-session';

declare module 'connect-pg-simple' {
  function pgConnect(session: any): (options: {
    pool: Pool;
    tableName?: string;
    createTableIfMissing?: boolean;
    pruneSessionInterval?: number;
    // Add other options as needed
  }) => session.Store;

  export = pgConnect;
}
