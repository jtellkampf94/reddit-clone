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
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
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
          {data!.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <Box>
                <Flex
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  mr={4}
                >
                  <IconButton
                    icon={<ChevronUpIcon />}
                    aria-label="updoot post"
                  />
                  {p.points}
                  <IconButton
                    icon={<ChevronDownIcon />}
                    aria-label="downdoot post"
                  />
                </Flex>
              </Box>
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>{" "}
                <Text>posted by {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Button
          onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
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
