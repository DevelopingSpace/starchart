import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { AbsoluteCenter, Button, Container, Stack, Text } from '@chakra-ui/react';
import { createLogoutRequest } from '~/lib/saml.server';
import { getUsername, hasUserLoggedOut, logout } from '~/session.server';

import type { ActionArgs, LoaderArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);
  const formData = await request.formData();

  const value = formData.get('tempUser');
  if (user !== undefined) {
    // Invalidate the Starchart session but do not log out from Seneca IDP.
    return logout(request, '/logout');
  }

  if (value) {
    //create slo request with saml stuff
    const context = createLogoutRequest(value as string);

    return redirect(context);
  }
  return redirect('/');
};

export const loader = async ({ request }: LoaderArgs) => {
  const cookies = request.headers.get('Cookie');

  const tempUser = await hasUserLoggedOut.parse(cookies);
  if (!tempUser) {
    return redirect('/');
  } else {
    //remove the cookie
    return json(tempUser, {
      headers: {
        'Set-Cookie': await hasUserLoggedOut.serialize(null),
      },
    });
  }
};

export default function Index() {
  const user = useLoaderData<string>();
  return (
    <AbsoluteCenter>
      <Container>
        <Stack spacing={6} align="left">
          <Text fontSize={'40px'}>{user}</Text>
          <Text fontSize={'30px'}>You have been logged out of My.Custom.Domain.</Text>
          <Text fontSize={'25px'}>
            If you would also like to be logged out of all other Seneca services click the "Seneca
            Logout" Button
          </Text>
          <Form method="post">
            <input type="hidden" name="tempUser" value={user} />
            <Button type="submit">Seneca Logout</Button>
          </Form>
        </Stack>
      </Container>
    </AbsoluteCenter>
  );
}
