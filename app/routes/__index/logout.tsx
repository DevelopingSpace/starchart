import { LoaderArgs, redirect } from '@remix-run/node';
import { getUsername, logout, requireUsername } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { AbsoluteCenter, Button, Container, Stack } from '@chakra-ui/react';
import { createLogoutRequest } from '~/lib/saml.server';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);
  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'slo':
      //create slo request with saml stuff
      if (user) {
        const context = createLogoutRequest(user);
        return redirect(context);
      }
      return redirect('/');
    case 'logoutStarchart':
      // Invalidate the Starchart session but do not log out from Seneca IDP.
      if (user) {
        return logout(request);
      }
      return redirect('/');
    default:
      return null;
  }
};

export const loader = async ({ request }: LoaderArgs) => requireUsername(request);

export default function Index() {
  return (
    <AbsoluteCenter>
      <Container>
        <Stack spacing={6}>
          <Form method="post">
            <input type="hidden" name="intent" value="slo" />
            <Button type="submit">Single Logout from all Seneca Services</Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="logoutStarchart" />
            <Button type="submit">Logout of Starchart and Starchart alone</Button>
          </Form>
        </Stack>
      </Container>
    </AbsoluteCenter>
  );
}
