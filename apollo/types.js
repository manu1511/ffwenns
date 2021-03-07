import { gql } from "@apollo/client";

export const typeDefs = gql`
  type Query {
    hello: String
  }
`;
