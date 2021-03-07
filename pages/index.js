import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

const helloQuery = gql`
  query hello {
    hello
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(helloQuery);

  return <main>{!loading && <h1>{data.hello}</h1>}</main>;
}
