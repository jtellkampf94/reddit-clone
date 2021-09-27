import { withUrqlClient } from "next-urql";
import { Box, Heading } from "@chakra-ui/layout";

import { createUrqlClient } from "../../utils/createUrqlClient";
import Layout from "../../components/Layout";
import { useGetPostfromUrl } from "../../utils/useGetPostFromUrl";

const Post: React.FC = () => {
  const [{ data, error, fetching }] = useGetPostfromUrl();

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
