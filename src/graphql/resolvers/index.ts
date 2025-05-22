import merge from "lodash.merge";
import { userResolvers } from "./user.js";
import { accountResolvers } from "./account.js";

// import listenersResolvers from "./listeners.js";

const resolvers = merge({}, userResolvers, accountResolvers);

export default resolvers;
