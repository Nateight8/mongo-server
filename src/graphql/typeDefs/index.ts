// Define the GraphQL schema

import { userAccounts } from "./account.js";
import { safetyNetTypeDefs } from "./safety.js";
import { userTypeDefs } from "./user.js";

const typeDefs = [userTypeDefs, userAccounts, safetyNetTypeDefs];

export default typeDefs;
