import { Fragment } from "react";
import { Box, Flex, Link } from "@chakra-ui/layout";
import NextLink from "next/link";

import { useMeQuery } from "../generated/graphql";
import { Button } from "@chakra-ui/button";

const NavBar: React.FC = () => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <Fragment>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </Fragment>
    );
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant="link">Logout</Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default NavBar;
