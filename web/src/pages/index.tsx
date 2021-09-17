import { useState } from "react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import {
  Link,
  Stack,
  Box,
  Heading,
  Text,
  Flex,
  Button,
} from "@chakra-ui/react";

import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>Query failed</div>;
  }
  return (
    <Layout>
      <Flex>
        <Heading align="center">Reddit Clone</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create Post</Link>
        </NextLink>
      </Flex>
      <div>Hello world</div>
      {fetching && !data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (
        <Button
          onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts[data.posts.length - 1].createdAt,
            });
          }}
          isLoading={fetching}
          m="auto"
          my={8}
        >
          Load More
        </Button>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
