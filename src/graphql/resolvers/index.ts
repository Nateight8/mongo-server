import merge from "lodash.merge";
import { userResolvers } from "./user.js";
import { accountResolvers } from "./account.js";
import { safetyNetResolvers } from "./safety-net.js";
import { planResolvers } from "./plan.js";

// import listenersResolvers from "./listeners.js";

const resolvers = merge(
  {},
  userResolvers,
  accountResolvers,
  safetyNetResolvers,
  planResolvers
);

export default resolvers;
