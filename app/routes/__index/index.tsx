import { Flex, Text, VStack, Link, Heading } from '@chakra-ui/react';
import type { LoaderArgs } from '@remix-run/node';

import { requireUsername } from '~/session.server';
import LandingPageCard from '~/components/landing-page/landing-page-card';
import { useUser } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => requireUsername(request);

export default function IndexRoute() {
  const user = useUser();

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
          maxWidth="42em"
          padding="5"
          flexDirection="column"
        >
          <Heading size="lg" textAlign="center">
            Welcome to My.Custom.Domain!
          </Heading>
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
        {user.isAdmin && (
          <LandingPageCard
            path="/admin"
            pathName="Admin"
            cardName="Admin"
            cardDescription="Search, View, and Manage Users, their DNS Records and Certificates."
          />
        )}
        <LandingPageCard
          path="/dns-records"
          pathName="Manage DNS Records"
          cardName="DNS Records"
          cardDescription="DNS Records are stored in Domain Name System (DNS) servers, which map a value to a domain name.  You can create a unique custom domain for each of your projects."
          instructionsPath="/dns-records/instructions"
        />
        <LandingPageCard
          path="/certificate"
          pathName="Manage Certificate"
          cardName="Certificate"
          cardDescription="An HTTPS Certificate allows a browser to establish a secure connection with your website. Any data between the client and your website will be encrypted and cannot be intercepted."
          instructionsPath="/certificate/instructions"
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
