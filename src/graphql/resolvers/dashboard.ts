import { journalingNoteTemplates } from "@/db/schema/journal.js";
import { tradingPlans } from "@/db/schema/plan.js";
import { GraphqlContext } from "@/types/types.utils.js";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";

const mockTrades = [
  {
    id: "1",
    symbol: "EURUSD",
    date: "2024-03-20",
    account: "FTMO FUNDED",
    direction: "Long",
    status: "CLOSED",
    projectedEntry: 1.085,
    actualEntry: 1.0845,
    projectedSL: 1.082,
    actualExit: 1.087,
    actualPL: 25.0,
    maxPossiblePL: 30.0,
    balance: 12500.0,
  },
  {
    id: "2",
    symbol: "GBPUSD",
    date: "2024-03-19",
    account: "GOATFUNDED DEMO",
    direction: "Short",
    status: "RUNNING",
    projectedEntry: 1.275,
    actualEntry: 1.2745,
    projectedSL: 1.278,
    actualExit: 1.272,
    actualPL: 25.0,
    maxPossiblePL: 30.0,
    balance: 10000.0,
  },
  {
    id: "3",
    symbol: "USDJPY",
    date: "2024-03-18",
    account: "FTMO CHALLENGE",
    direction: "Long",
    status: "CLOSED",
    projectedEntry: 151.5,
    actualEntry: 151.45,
    projectedSL: 151.2,
    actualExit: 151.8,
    actualPL: 35.0,
    maxPossiblePL: 40.0,
    balance: 5000.0,
  },
  {
    id: "4",
    symbol: "AUDUSD",
    date: "2024-03-17",
    account: "MYFUNDEDFX",
    direction: "Short",
    status: "RUNNING",
    projectedEntry: 0.655,
    actualEntry: 0.6545,
    projectedSL: 0.658,
    actualExit: 0.652,
    actualPL: 25.0,
    maxPossiblePL: 30.0,
    balance: 7500.0,
  },
  {
    id: "5",
    symbol: "USDCAD",
    date: "2024-03-16",
    account: "FTMO FUNDED",
    direction: "Long",
    status: "CLOSED",
    projectedEntry: 1.355,
    actualEntry: 1.3545,
    projectedSL: 1.352,
    actualExit: 1.357,
    actualPL: 25.0,
    maxPossiblePL: 30.0,
    balance: 12500.0,
  },
];

export const dashboardResolvers = {
  Query: {
    dashboard: async (_: unknown, __: unknown, ctx: GraphqlContext) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        const [plan] = await db
          .select()
          .from(tradingPlans)
          .where(eq(tradingPlans.userId, user.id))
          .limit(1);

        if (!plan) {
          throw new GraphQLError("Trading plan not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const [template] = await db
          .select()
          .from(journalingNoteTemplates)
          .where(eq(journalingNoteTemplates.userId, user.id))
          .limit(1);

        if (!template) {
          throw new GraphQLError("Journal template not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        //mock return for now
        return {
          portfolioOverview: {
            totalValue: 100000,
            pnl: {
              value: "+5000",
              percentage: "+5%",
            },
            overviewStats: {
              winRate: {
                value: "60%",
                percentage: "+10%",
              },
              profitFactor: {
                value: "1.5",
                percentage: "+5%",
              },
              avgReturn: {
                value: "2.3%",
                percentage: "+1.2%",
              },
              maxDrawdown: {
                value: "-4%",
                percentage: "-1%",
              },
              tradeStats: {
                open: mockTrades.filter((t) => t.status === "RUNNING").length,
                total: mockTrades.length,
              },
            },
          },
          winLossTradeStats: {
            totalTrades: mockTrades.length,
            wins: mockTrades.filter((t) => t.actualPL > 0).length,
            losses: mockTrades.filter((t) => t.actualPL <= 0).length,
            totalRisk: 200, // placeholder
            totalReward: 400, // placeholder
          },
          recentTrades: mockTrades,
          tradingPlan: plan,
          journalTemplate: template,
        };
      } catch (error) {
        console.error("Error fetching trading plan:", error);
        throw new GraphQLError("Failed to fetch trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
