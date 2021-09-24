import { Flex, IconButton } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";
import { useState } from "react";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");

  const [, vote] = useVoteMutation();

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          setLoadingState("updoot-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "updoot-loading"}
        icon={<ChevronUpIcon />}
        aria-label="updoot post"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          setLoadingState("downdoot-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downdoot-loading"}
        icon={<ChevronDownIcon />}
        aria-label="downdoot post"
      />
    </Flex>
  );
};

export default UpdootSection;
