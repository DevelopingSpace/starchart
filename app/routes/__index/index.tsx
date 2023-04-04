import { Flex, Text, VStack, Link, Heading } from '@chakra-ui/react';
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
    <VStack alignSelf="center">
      <Flex
        flexDirection="column"
        alignItems="center"
        width={{ base: 'full', sm: '80%' }}
        paddingY={{ base: '2', md: '7' }}
        gap={{ md: '16' }}
      >
        <Flex
          width={{ base: '100%', md: '75%' }}
          textAlign="center"
          padding="5"
          flexDirection="column"
        >
          <Heading size="lg">Welcome to My.Custom.Domain!</Heading>
          <Text fontSize={{ base: 'sm', md: 'lg' }} mt={4}>
            My.Custom.Domain allows you to create unique domain names for your projects that can be
            accessed on the internet and secure them with an HTTPS certificate, providing a secure
            connection between clients and your domain.
          </Text>
        </Flex>
      </Flex>
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        justifyContent="center"
        paddingY="5"
        paddingX={{ base: '10', md: '5' }}
        gap={{ base: '5', lg: '10' }}
        width={{ base: 'full', sm: 'md' }}
      >
        <LandingPageCard
          path="/dns-records"
          pathName="Manage DNS Records"
          cardName="DNS Records"
          cardDescription="DNS Record is a data stored in Domain Name System (DNS) servers, which maps a value to a domain name.  You can create a unique custom domain for each of your projects by submitting a simple form."
        />
        <LandingPageCard
          path="/certificate"
          pathName="Manage Certificate"
          cardName="Certificate"
          cardDescription="When a client visits your website that has an HTTPS (Hypertext Transfer Protocol Secure) certificate, the client's browser verifies the authenticity of the certificate and establishes a secure connection with your website. Any data between the client and your website will be encrypted and cannot be intercepted."
        />
      </Flex>
      <Flex paddingTop={{ sm: '20' }}>
        <Link href="https://www.senecacollege.ca/about/policies/information-technology-acceptable-use-policy.html">
          <Text fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} color="brand.500">
            Seneca's IT Acceptable Use Policy
          </Text>
        </Link>
      </Flex>
    </VStack>
  );
}
