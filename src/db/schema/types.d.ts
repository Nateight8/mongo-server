import type { PgTableWithColumns } from 'drizzle-orm/pg-core';
import type { InferModel } from 'drizzle-orm';

// Export the UserTable type
export interface UserTable extends PgTableWithColumns<{
  name: 'users';
  schema: undefined;
  columns: {
    id: { name: 'id'; dataType: 'string'; notNull: true };
    name: { name: 'name'; dataType: 'string'; notNull: false };
    email: { name: 'email'; dataType: 'string'; notNull: true };
    // Add other columns as needed
  };
}> {}

declare module "./auth.js" {
  export const users: UserTable;
  export type User = InferModel<UserTable>;
  export type NewUser = InferModel<UserTable, 'insert'>;
}

declare module "./account.js" {
  // Add account-related types if needed
  export const accounts: any;
  export type Account = any;
  export type NewAccount = any;
}
