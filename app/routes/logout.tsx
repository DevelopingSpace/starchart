import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import {
  AbsoluteCenter,
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Stack,
  Text,
} from '@chakra-ui/react';
import { createLogoutRequest } from '~/lib/saml.server';
import { getUsername, sloUsernameCookie, logout } from '~/session.server';

import type { ActionArgs, LoaderArgs } from '@remix-run/node';

export const action = async ({ request }: ActionArgs) => {
  const user = await getUsername(request);
  if (user) {
    // Invalidate the Starchart session but do not log out from Seneca IDP.
    return logout(request, '/logout');
  }

  const formData = await request.formData();
  const sloUsername = formData.get('sloUsername');
  if (typeof sloUsername === 'string') {
    // create slo request with saml stuff
    const context = createLogoutRequest(sloUsername);
    return redirect(context);
  }
  return redirect('/');
};

export const loader = async ({ request }: LoaderArgs) => {
  const cookies = request.headers.get('Cookie');

  const sloUsername = await sloUsernameCookie.parse(cookies);
  if (!sloUsername) {
    return redirect('/');
  }
  // remove the SLO cookie
  return json(sloUsername, {
    headers: {
      'Set-Cookie': await sloUsernameCookie.serialize(null),
    },
  });
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
        </Stack>
        <Box marginTop={10}>
          <Form method="post">
            <input type="hidden" name="sloUsername" value={user} />
            <Center>
              <ButtonGroup>
                <Button type="submit" backgroundColor={'grey'}>
                  Seneca Logout
                </Button>
                <Link to={{ pathname: '/' }}>
                  <Button>Back to Sign In</Button>
                </Link>
              </ButtonGroup>
            </Center>
          </Form>
        </Box>
      </Container>
    </AbsoluteCenter>
  );
}
