// Define the GraphQL schema

import { userAccounts } from "./account.js";
import { planTypeDefs } from "./plan.js";
import { safetyNetTypeDefs } from "./safety.js";
import { userTypeDefs } from "./user.js";
import { dashboardTypeDefs } from "./dashboard.js";
import { analyticsTypeDefs } from "./analytics.js";
import { journalTypeDefs } from "./journal.js";

const typeDefs = [
  userTypeDefs,
  userAccounts,
  safetyNetTypeDefs,
  planTypeDefs,
  dashboardTypeDefs,
  analyticsTypeDefs,
  journalTypeDefs,
];

export default typeDefs;
