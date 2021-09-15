import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <div>Hello world</div>
      {!data ? null : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
