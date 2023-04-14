import { Flex, Text, VStack, Link, Heading } from '@chakra-ui/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import type { LoaderArgs } from '@remix-run/node';

import { requireUsername } from '~/session.server';
import LandingPageCard from '~/components/landing-page/landing-page-card';
import { useEffectiveUser } from '~/utils';

import { getDnsRecordCountByUsername } from '~/models/dns-record.server';
import { getCertificateByUsername } from '~/models/certificate.server';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return typedjson({
    dnsRecordCount: await getDnsRecordCountByUsername(username),
    mostRecentCertificate: await getCertificateByUsername(username),
  });
};

export default function IndexRoute() {
  const user = useEffectiveUser();
  const { dnsRecordCount, mostRecentCertificate } = useTypedLoaderData<typeof loader>();

  return (
    <VStack alignSelf="center">
      <Flex
        flexDirection="column"
        alignItems="center"
        width={{ base: 'full', sm: '80%' }}
        paddingY={{ base: '2', md: '7' }}
        gap={{ md: '16' }}
      >
        <Flex width={{ base: '100%', md: '3xl' }} padding="5" flexDirection="column">
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
        flexWrap="wrap"
        justifyContent="center"
        paddingY="5"
        paddingX={{ base: '10', md: '5' }}
        gap={{ base: '5', lg: '10' }}
        width={{ base: 'full', sm: 'md', md: 'full' }}
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
          pathName={dnsRecordCount > 0 ? 'Manage DNS Records' : 'Create DNS Records'}
          cardName="DNS Records"
          cardDescription="DNS Records are stored in Domain Name System (DNS) servers, which map a value to a domain name.  You can create a unique custom domain for each of your projects."
          instructionsPath="/dns-records/instructions"
        />
        <LandingPageCard
          path="/certificate"
          pathName={mostRecentCertificate ? 'Manage Certificate' : 'Create Certificate'}
          cardName="Certificate"
          cardDescription="An HTTPS Certificate allows a browser to establish a secure connection with your website. Any data between the client and your website will be encrypted and cannot be intercepted."
          instructionsPath="/certificate/information"
        />
      </Flex>
      <Flex paddingTop={{ sm: '20' }}>
        <Link
          href="https://www.senecacollege.ca/about/policies/information-technology-acceptable-use-policy.html"
          fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
          target="_blank"
        >
          Seneca's IT Acceptable Use Policy
        </Link>
      </Flex>
    </VStack>
  );
}
