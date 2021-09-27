import { useGetIntId } from "./useGetIntId";
import { usePostQuery } from "../generated/graphql";

export const useGetPostfromUrl = () => {
  const intId = useGetIntId();

  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
