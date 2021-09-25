import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Box, Heading } from "@chakra-ui/layout";

import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import Layout from "../../components/Layout";

const Post: React.FC = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <Heading mb={4}>{data.post.title}</Heading>
        {data.post.text}
      </div>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
