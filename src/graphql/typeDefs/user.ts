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

  enum AccountCurrency {
    USD
    EUR
    GBP
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

  type Query {
    """
    Get the currently logged-in user's data
    """
    getLoggedInUser: GetLoggedInUserReturn
    """
    Get all users (admin only)
    """
    getAllUsers: GetAllUsersResponse
  }

  type Mutation {
    """
    Update user profile information
    """
    updateUserProfile(input: UserProfileInput!): UpdateUserResponse
  }

  input UserProfileInput {
    name: String
    email: String
    image: String
    location: String
    address: String
    phoneVerified: Boolean
    onboardingCompleted: Boolean
    banner: String
    bio: String
    displayName: String
  }
`;
