import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  """
  Response type for user update operations
  Contains success status, optional message, and the updated user data
  """
  type UpdateUserResponse {
    success: Boolean!
    message: String
    user: User
  }

  """
  Core User type representing a user in the system
  Contains all essential user profile information and metadata
  """
  type User {
    """
    Unique identifier for the user
    """
    id: ID!
    """
    User's full name
    """
    name: String
    """
    User's display name (can be different from real name)
    """
    displayName: String
    """
    User's biographical information
    """
    bio: String
    """
    User's email address
    """
    email: String
    """
    Timestamp when email was verified
    """
    emailVerified: String
    """
    URL to user's profile image
    """
    image: String
    """
    User's geographical location
    """
    location: String
    """
    User's physical address
    """
    address: String
    """
    Whether phone number is verified
    """
    phoneVerified: Boolean
    """
    Whether user has completed onboarding process
    """
    onboardingCompleted: Boolean
    """
    URL to user's banner/cover image
    """
    banner: String
    """
    Unique username for the user
    """
    username: String
    """
    Timestamp when user account was created
    """
    createdAt: String
    """
    Timestamp of last profile update
    """
    updatedAt: String
    """
    Unique identifier for chat/messaging system
    """
    participantId: String
  }

  """
  Response type for fetching logged-in user
  Includes HTTP status code and user data
  """
  type GetLoggedInUserReturn {
    status: Int
    user: User
  }

  """
  Response type for fetching all users
  Includes HTTP status code and array of users
  """
  type GetAllUsersResponse {
    status: Int
    users: [User!]!
  }

  """
  Response type for logged-in user operations
  Contains just the user data
  """
  type LoggedInUserResponse {
    user: User
  }

  """
  Portfolio performance overview type
  Contains key trading metrics and performance data
  """
  type PortfolioOverview {
    """
    Current total balance across all accounts
    """
    currentBalance: Float!
    """
    Return on Investment percentage
    """
    roi: Float!
    """
    Total Profit and Loss
    """
    pnl: Float!
    """
    Overall win rate percentage
    """
    winrate: Float!
    """
    Historical performance data points
    """
    chartData: [ChartPoint!]!
  }

  """
  Single data point for portfolio performance charts
  """
  type ChartPoint {
    """
    X-axis value of the data point (timestamp, date, etc.)
    """
    x: String!
    """
    Actual performance value
    """
    actual: Float!
    """
    Projected/expected performance value
    """
    projected: Float!
  }

  """
  Represents a trading account with its configuration and settings
  """
  type TradingAccount {
    """
    Unique identifier for the trading account
    """
    id: ID!
    """
    Name of the trading account
    """
    accountName: String!
    """
    Broker name/platform
    """
    broker: String!
    """
    Currency used for the account
    """
    accountCurrency: String!
    """
    Maximum allowed daily drawdown percentage
    """
    maxDailyDrawdown: Float!
    """
    Maximum allowed total drawdown percentage
    """
    maxTotalDrawdown: Float!
    """
    Current account balance
    """
    accountSize: Float!
    """
    Risk percentage per trade
    """
    riskPerTrade: Float!
    """
    Maximum daily risk percentage
    """
    maxDailyRisk: Float!
    """
    User's trading style (e.g., day trading, swing trading)
    """
    tradingStyle: String!
    """
    Preferred risk-reward ratio
    """
    riskRewardRatio: String!
    """
    User's timezone for trading sessions
    """
    timeZone: String!
    """
    Maximum number of concurrent open trades
    """
    maxOpenTrades: Int!
    """
    Preferred trading sessions (e.g., London, New York)
    """
    tradingSessions: [String!]!
    """
    Optional notes about trading plan
    """
    planNote: String
    """
    Timestamp when account was created
    """
    createdAt: String!
    """
    Timestamp of last account update
    """
    updatedAt: String!
  }

  """
  Comprehensive trading data for a user
  Combines portfolio overview with account details
  """
  type UserTradeData {
    overview: PortfolioOverview!
    accounts: [TradingAccount!]!
  }

  """
  Available queries for user-related operations
  """
  type Query {
    """
    Get the currently logged-in user's data
    """
    getLoggedInUser: GetLoggedInUserReturn
    """
    Get a list of all users in the system
    """
    getAllUsers: GetAllUsersResponse
    """
    Check if a username is available for registration
    """
    checkUsernameAvailability(username: String!): Boolean!
    """
    Get comprehensive trading data for the current user
    """
    userTradeData: UserTradeData!
  }

  """
  Available mutations for user-related operations
  """
  type Mutation {
    """
    Update user profile information
    All fields are optional and only provided fields will be updated
    """
    updateUser(
      name: String
      email: String
      displayName: String
      bio: String
      image: String
      location: String
      address: String
      phoneVerified: Boolean
      onboardingCompleted: Boolean
      banner: String
    ): UpdateUserResponse

    """
    Update user's username
    """
    updateUsername(username: String!): UpdateUserResponse

    """
    Delete user account
    """
    deleteUser: Boolean!

    """
    Complete user onboarding process
    """
    onboardUser(input: OnboardUserInput!): OnboardUserResponse!
  }

  """
  Input type for user onboarding data
  Contains all necessary information to set up a new trading account
  """
  input OnboardUserInput {
    """
    Name of the trading account
    """
    accountName: String!
    """
    Broker name/platform
    """
    broker: String!
    """
    Currency used for the account
    """
    accountCurrency: String!
    """
    Maximum allowed daily drawdown percentage
    """
    maxDailyDrawdown: Float!
    """
    Maximum allowed total drawdown percentage
    """
    maxTotalDrawdown: Float!
    """
    Initial account size/balance
    """
    accountSize: String!
    """
    Risk percentage per trade
    """
    riskPerTrade: Float!
    """
    Maximum daily risk percentage
    """
    maxDailyRisk: Float!
    """
    User's trading style (e.g., day trading, swing trading)
    """
    tradingStyle: String!
    """
    Preferred risk-reward ratio
    """
    riskRewardRatio: String!
    """
    User's timezone for trading sessions
    """
    timeZone: String!
    """
    Maximum number of concurrent open trades
    """
    maxOpenTrades: Int!
    """
    Preferred trading sessions (e.g., London, New York)
    """
    tradingSessions: [String!]!
    """
    Optional notes about trading plan
    """
    planNote: String
  }

  """
  Response type for user onboarding operation
  """
  type OnboardUserResponse {
    success: Boolean!
    message: String
  }
`;

export interface UserProfileInput {
  name: string | null;
  email: string | null;
  image: string | null;
  location: string | null;
  address: string | null;
  phoneVerified: boolean | null;
  onboardingCompleted: boolean | null;
  banner: string | null;
  bio: string | null;
  displayName: string | null;
}
