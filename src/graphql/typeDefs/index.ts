// Define the GraphQL schema

import { userAccounts } from "./account.js";
import { planTypeDefs } from "./plan.js";
import { safetyNetTypeDefs } from "./safety.js";
import { userTypeDefs } from "./user.js";

const typeDefs = [userTypeDefs, userAccounts, safetyNetTypeDefs, planTypeDefs];

export default typeDefs;
