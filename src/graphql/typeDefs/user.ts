import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  enum OnboardingStep {
    account_setup
    profile_setup
    preferences
    completed
  }

  type User {
    id: String!
    name: String
    email: String!
    image: String
    onboardingStep: OnboardingStep
    createdAt: String
    updatedAt: String
  }

  type Query {
    me: User
  }
`;
