import { Heading, Text } from '@chakra-ui/react';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { requireUsername } from '~/session.server';
import { useUser } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return json({ username });
};

export default function IndexRoute() {
  const user = useUser();
  return (
    <div>
      <Heading as="h1" size="3xl" noOfLines={1}>
        Starchart
      </Heading>
      <Text fontSize="xl">Start making your own custom domains and certificates today!</Text>
      <Text>Welcome {user.username}</Text>
    </div>
  );
}
