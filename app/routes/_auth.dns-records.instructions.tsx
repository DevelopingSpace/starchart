import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Heading,
  Text,
  Grid,
  VStack,
  ListItem,
  OrderedList,
  Link as ChakraLink,
  Accordion,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import FaqAccordion from '~/components/instructions/faq-accordion';

export default function CertificateInstructionsRoute() {
  return (
    <Flex flexDirection="column" maxWidth={750}>
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }} mb="4">
        DNS Records
      </Heading>
      <Grid templateColumns="repeat(1, 1fr)" gap="4">
        <VStack alignItems="flex-start">
          <Heading as="h3" size="md">
            What is a DNS Record?
          </Heading>
          <Text>
            A DNS record is a type of data stored in a domain name system (DNS) server that maps a
            domain name to an IP address or other information about the domain. DNS records can
            store a variety of data beyond just IP addresses, including information about mail
            servers, subdomains, and more. In th next section, we'll explore some of the most common
            types of DNS records and how they're used.
          </Text>
        </VStack>
        <VStack alignItems="flex-start">
          <Heading as="h3" size="md">
            DNS Record Types
          </Heading>
          <Tabs>
            <TabList>
              <Tab>
                <Text fontWeight="medium">A Record</Text>
              </Tab>
              <Tab>
                <Text fontWeight="medium">AAAA Record</Text>
              </Tab>
              <Tab>
                <Text fontWeight="medium">CNAME Record</Text>
              </Tab>
              <Tab>
                <Text fontWeight="medium">TXT Record</Text>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Purpose:{' '}
                  </Text>
                  Maps a domain name to an IPv4 address.
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Example:{' '}
                  </Text>
                  Your project's domain name is "my-project.user.mystudentproject.ca" and its IPv4
                  address is "192.168.0.1". Create an A record to associate these two.
                </Text>
              </TabPanel>
              <TabPanel>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Purpose:{' '}
                  </Text>
                  Maps a domain name to an IPv6 address.
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Example:{' '}
                  </Text>
                  Your project's domain name is "my-ipv6-project.user.mystudentproject.ca" and its
                  IPv6 address is "2001:0db8:85a3:0000:0000:8a2e:0370:7334". Create an AAAA record
                  to associate these two.
                </Text>
              </TabPanel>
              <TabPanel>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Purpose:{' '}
                  </Text>
                  Maps a domain name to another domain name.
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Example:{' '}
                  </Text>
                  Your project's domain name is "my-project.user.mystudentproject.ca", and you also
                  have a custom domain called "my-custom-domain.com". Create a CNAME record to map
                  "my-custom-domain.com" to "my-project.user.mystudentproject.ca".
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Note:{' '}
                  </Text>
                  When creating a CNAME record, remember to only include the domain name in the
                  value field. Including other parts of a URL, such as "https://" or a trailing "/",
                  can cause the CNAME record to fail to resolve correctly.
                </Text>
              </TabPanel>
              <TabPanel>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Purpose:{' '}
                  </Text>
                  Allows the domain owner to add arbitrary text to the DNS record, often used for
                  verification purposes.
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Example:{' '}
                  </Text>
                  You need to verify your domain ownership for a third-party service. They provide a
                  unique code "12345abcde". Create a TXT record with the value "12345abcde" for your
                  domain.
                </Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
        <VStack alignItems="flex-start">
          <Heading as="h3" size="md">
            How to Create the first DNS Record?
          </Heading>
          <OrderedList listStylePos="inside" spacing="2">
            <ListItem>
              Go to the{' '}
              <Link to={{ pathname: '/dns-records' }}>
                <Text as="span" textDecoration="underline">
                  DNS records page.
                </Text>
              </Link>
            </ListItem>
            <ListItem>
              Hit the "Create your first DNS Record!" button: On the DNS records page, click the
              "Create your first DNS Record!" button to open the DNS record creation form.
            </ListItem>
            <ListItem>
              Put appropriate values in fields: Fill in the required information for the selected
              record type. (Refer to the previous section to learn about DNS record types and their
              corresponding values.) Some fields are optional and they are used mainly for data
              collection purposes, feel free to leave them blank.
            </ListItem>
            <ListItem>
              Hit the "Create" button: After entering the required information, click the "Create"
              button to generate your DNS record.
            </ListItem>
          </OrderedList>
          <Text>
            Remember to test your project's web address to ensure it is accessible and functioning
            correctly. Note that it may take some time for DNS changes to propagate.
          </Text>
          <Text>
            For more information on DNS Records refer{' '}
            <ChakraLink
              href="https://www.cloudflare.com/learning/dns/dns-records"
              isExternal
              textDecoration="underline"
            >
              here.
            </ChakraLink>
          </Text>
        </VStack>
        <VStack alignItems="flex-start">
          <Heading as="h3" size="md">
            FAQ
          </Heading>
          <Accordion allowMultiple width="full">
            <FaqAccordion title="How long does it take for DNS changes to propagate and become accessible?">
              <Text>
                DNS propagation time can vary depending on factors such as the specific DNS servers
                involved, and the geographical location of users accessing the records. Typically,
                DNS changes can take anywhere from a few minutes to 48 hours to propagate fully
                across the internet.
              </Text>
              <Text mt="4">
                To help you monitor the propagation status of your DNS records, we provide an
                information icon <InfoOutlineIcon color="black" boxSize="4" /> next to each record.
                Clicking on this icon will take you to a DNS record propagation map, where you can
                track the progress of your DNS changes in real-time. This map shows you which DNS
                servers around the world have updated their cache with your new record information,
                allowing you to gauge when your changes will become accessible globally.
              </Text>
            </FaqAccordion>
            <FaqAccordion title="Are there any limitations or restrictions on the number of DNS records I can create?">
              <Text>
                Yes, there is a limitation on the number of DNS records you can create. Each user is
                allowed to create up to certain number DNS records for their projects. You could see
                your current limit at{' '}
                <Link to={{ pathname: '/dns-records' }}>
                  <Text as="span" textDecoration="underline">
                    DNS records page.
                  </Text>
                </Link>
                This limit helps manage resources efficiently and ensures fair usage of the platform
                for all students
              </Text>
            </FaqAccordion>
          </Accordion>
        </VStack>
      </Grid>
    </Flex>
  );
}
