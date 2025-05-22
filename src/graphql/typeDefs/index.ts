// Define the GraphQL schema

import { userAccounts } from "./account.js";
import { userTypeDefs } from "./user.js";

const typeDefs = [userTypeDefs, userAccounts];

export default typeDefs;
