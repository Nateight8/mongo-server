import { Pool } from 'pg';
import session from 'express-session';

declare function pgConnect(
  session: (options?: session.SessionOptions) => any
): new (options: {
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

export = pgConnect;
