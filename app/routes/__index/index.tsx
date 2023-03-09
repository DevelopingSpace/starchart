import { Flex, Heading, Text, VStack } from '@chakra-ui/react';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { requireUsername } from '~/session.server';
import LandingPageCard from '~/components/landing-page/landing-page-card';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return json({ username });
};

export default function IndexRoute() {
  return (
    <VStack alignSelf="center" height="full">
      <Flex
        flexDirection="column"
        alignItems="center"
        width="100%"
        paddingY={{ base: '2', md: '7' }}
        marginTop="16"
        gap={{ md: '16' }}
      >
        <Heading color="brand.500" size={{ base: 'lg', md: 'xl' }}>
          My.Custom.Domains
        </Heading>
        <Flex width={{ base: '100%', md: '50%' }} textAlign="center" padding="5">
          <Text fontSize={{ base: 'sm', md: 'lg' }}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book.
          </Text>
        </Flex>
      </Flex>
      <Flex
        flexDirection={{ base: 'column', sm: 'row' }}
        justifyContent="center"
        paddingY="10"
        paddingX={{ base: '10', md: '5' }}
        gap={{ base: '5', lg: '10' }}
      >
        <LandingPageCard
          path="/domains"
          pathName="Records Table"
          cardName="DNS Records"
          cardDescription="DNS: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        />
        <LandingPageCard
          path="/certificate"
          pathName="Certificate"
          cardName="Certificate"
          cardDescription="Certificate: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        />
      </Flex>
    </VStack>
  );
}
