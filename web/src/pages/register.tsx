import React from "react";
import { Form, Formik } from "formik";
import { Button, Box } from "@chakra-ui/react";
import { useMutation } from "urql";

import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";

const REGISTER_MUTATION = `
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(options: { email: $email, username: $username, password: $password}) {
      errors {
        field
        message
      }
      user {
        id
        email
        username
        createdAt
        updatedAt
      }
    }
  }
`;

const Register: React.FC = () => {
  const [, register] = useMutation(REGISTER_MUTATION);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={(values, actions) => {
          return register(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              type="email"
              name="email"
              placeholder="email"
              label="Email"
            />
            <Box mt={4}>
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
            </Box>
            <Box mt={4}>
              <InputField
                type="password"
                name="password"
                placeholder="password"
                label="Password"
              />
            </Box>
            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isSubmitting}
              type="submit"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
