import { useState } from "react";
import { NextPage } from "next";
import { Form, Formik } from "formik";
import { Button, Box, Link } from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";

import { createUrqlClient } from "../../utils/createUrqlClient";
import Wrapper from "../../components/Wrapper";
import InputField from "../../components/InputField";
import { toErrorMap } from "../../utils/toErrorMap";
import { useChangePasswordMutation } from "../../generated/graphql";

interface ChangePasswordProps {
  token: string;
}

const ChangePassword: NextPage<ChangePasswordProps> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token,
            newPassword: values.newPassword,
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPaswsword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError && (
              <Box>
                <Box color="red">{tokenError}</Box>
                <NextLink href="/forgot-password">
                  <Link>go forget it again</Link>
                </NextLink>
              </Box>
            )}
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isSubmitting}
              type="submit"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
