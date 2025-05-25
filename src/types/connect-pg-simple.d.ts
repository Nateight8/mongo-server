import { Store } from 'express-session';
import { Pool } from 'pg';

declare function pgConnect(session: any): new (options: {
  pool: Pool;
  tableName?: string;
  schemaName?: string;
  pruneSessionInterval?: number | false;
  pruneSessionRandomizedInterval?: boolean;
  ttl?: number;
  disableTouch?: boolean;
  createTableIfMissing?: boolean;
}) => Store & {
  pruneSessions(): Promise<void>;
};

export = pgConnect;
