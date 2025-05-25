import { mockTradeAnalytics } from "../../lib/data.js";
import { getEquityCurve } from "../../services/equity-curve.js";
import { getSymbolAnalytics } from "../../services/symbol.js";

export const analyticsResolver = {
  Query: {
    tradersAnalytics: async (
      _parent: unknown,
      _args: unknown,
      _context: unknown
    ) => {
      const symbolAnalytics = getSymbolAnalytics(mockTradeAnalytics);
      const equityCurve = getEquityCurve();

      return {
        symbolAnalytics,
        equityCurve,
      };
    },
  },
};
