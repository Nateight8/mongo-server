// Define the GraphQL schema

import { userAccounts } from "./user-account.js";
import { userTypeDefs } from "./user.js";

const typeDefs = [userTypeDefs, userAccounts];

export default typeDefs;
