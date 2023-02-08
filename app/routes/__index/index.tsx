import { Heading, Text, Button } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { requireUsername } from '~/session.server';

import type { LoaderArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return json({ username });
};

export default function IndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Heading as="h1" size="3xl" noOfLines={1}>
        Starchart
      </Heading>
      <Text fontSize="xl">Start making your own custom domains and certificates today!</Text>
      <Text>Welcome {data.username}</Text>
      <Form action="/logout" method="post">
        <Button type="submit">Logout</Button>
      </Form>
    </div>
  );
}
