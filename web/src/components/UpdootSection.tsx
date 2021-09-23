import { Flex, IconButton } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PostsQuery } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostsQuery["posts"]["posts"][0];
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton icon={<ChevronUpIcon />} aria-label="updoot post" />
      {post.points}
      <IconButton icon={<ChevronDownIcon />} aria-label="downdoot post" />
    </Flex>
  );
};

export default UpdootSection;
