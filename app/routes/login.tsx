import { Heading, Text, Button } from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { createUserSession } from "~/session.server";

import type { ActionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionArgs) => {
  return createUserSession({
    request: request,
    username: "starchartdev",
    remember: false,
    redirectTo: "/",
  });
};

export default function Login() {
  return (
    <Form method="post">
      <Heading>Login</Heading>
      <Text>You will be logged in (a session will be created for you)</Text>
      <Button type="submit" colorScheme="red">
        Login
      </Button>
    </Form>
  );
}
