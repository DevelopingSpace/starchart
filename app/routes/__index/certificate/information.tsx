import {
  Heading,
  Text,
  Link,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Accordion,
  Flex,
  ListItem,
  OrderedList,
} from '@chakra-ui/react';
import { Link as RemixLink } from '@remix-run/react';
import { LockIcon } from '@chakra-ui/icons';

import FaqAccordion from '~/components/instructions/faq-accordion';

export default function CertificateInstructionsRoute() {
  return (
    <Flex flexDirection="column" paddingBottom="20" maxWidth={750}>
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }} mb="4">
        What is an SSL Certificate?
      </Heading>
      <Box>
        <Text>
          An SSL Certificate is like a digital lock that keeps information exchanged between your
          computer and a website private and secure. It helps protect your sensitive information
          like credit card numbers, login credentials, and other personal information from being
          intercepted by hackers or cybercriminals.
          <br />
          <br />
          When a website has an SSL certificate, you'll see a padlock icon and the web address
          changes from "http" to "https" in your browser's address bar. This means that the
          connection between your computer and the website is encrypted and secure.
          <br />
          <br />
          SSL certificates are essential for websites that collect sensitive information from users,
          like online stores, banks, or any site that requires you to enter personal information.
          They help build trust between websites and their users and ensure that your data is kept
          private and secure.
        </Text>

        <Heading as="h3" size="md" marginTop="5">
          Browser Security Warnings
        </Heading>

        <Text marginTop="3">
          When browsing the internet, you may have noticed a padlock (
          <LockIcon boxSize="3" marginBottom="1" />) symbol next to the website's URL. This padlock
          indicates whether the website has a valid SSL/TLS certificate, which is used to secure the
          website and encrypt any data exchanged between the website and your browser.
          <br />
          <br />
          Unfortunately, there are malicious websites that do not provide any sense of security and
          may not be able to prove their identity to your web browser, potentially leading to safety
          issues when trying to access them. To ensure your safety while browsing the internet,
          user-friendly browsers like Chrome automatically block access to such sites that could
          harm your computer, as illustrated&nbsp;
          <Link color="brand.500" href="https://expired-rsa-dv.ssl.com">
            here.
          </Link>
          &nbsp;For more examples of website certificate status, visit&nbsp;
          <Link
            color="brand.500"
            href="https://www.ssl.com/sample-valid-revoked-and-expired-ssl-tls-certificates/"
          >
            this page.
          </Link>
          &nbsp;Lastly, you can check if your dns-record has a valid certificate by visiting&nbsp;
          <Link color="brand.500" href="https://www.sslshopper.com/ssl-checker.html">
            SSL Shopper.
          </Link>
        </Text>

        <Heading as="h3" size="md" marginTop="5">
          Types of Certificate
        </Heading>
        <Text marginTop="3">
          Once you have obtained a certificate, you are granted the authority to use it for specific
          services. The certificate consists of four main components
        </Text>

        <Heading as="h3" size="md" marginTop="5">
          Request Certificate
        </Heading>
        <OrderedList listStylePos="inside" spacing="2" marginTop="3">
          <ListItem>
            Go to&nbsp;
            <Link as={RemixLink} to="/certificate">
              Certificate Page
            </Link>
          </ListItem>
          <ListItem>
            Click on <strong>Request a Certificate</strong> button
          </ListItem>
          <ListItem>
            You will be greeted with a loading page, and will receive an email once your certificate
            has been processed
          </ListItem>
          <Text>
            Do remember that if your certificate fails to be issued, you will be notified via email,
            and you can request a new certificate.
          </Text>
        </OrderedList>

        <Tabs marginY="3" isFitted>
          <TabList>
            <Tab>Public Certificate</Tab>
            <Tab>Private Key</Tab>
            <Tab>Intermediate Chain</Tab>
            <Tab>Full Chain</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Text>
                A digital document that proves the identity of an entity, such as a user or
                organization, and establishes a secure connection between their web browser and a
                website or server. It uses a pair of encryption keys, one public and one private,
                and is issued by a trusted third party called a certification authority. For more
                information&nbsp;
                <Link
                  color="brand.500"
                  href="https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/"
                >
                  click here
                </Link>
              </Text>
            </TabPanel>
            <TabPanel>
              <Text>
                Used to decrypt data that has been encrypted with the corresponding public key, and
                to digitally sign documents or messages. For more information&nbsp;
                <Link
                  color="brand.500"
                  href="https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/"
                >
                  click here
                </Link>
              </Text>
            </TabPanel>
            <TabPanel>
              <Text>
                A set of certificates that are used to verify the authenticity of an SSL/TLS
                certificate. They serve as a bridge between the SSL/TLS certificate and the root
                Certificate Authority (CA) to establish a chain of trust, ensuring that the SSL/TLS
                certificate is valid and secure. For more information&nbsp;
                <Link
                  color="brand.500"
                  href="https://support.dnsimple.com/articles/what-is-ssl-certificate-chain/"
                >
                  click here
                </Link>
              </Text>
            </TabPanel>
            <TabPanel>
              A file that combines an SSL certificate (Public Certificate) with its intermediate
              certificates, creating a trust connection between a server and a client. In simpler
              terms, it makes sure online communication is secure and trustworthy.
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Accordion allowMultiple>
          <Heading as="h3" size="md" marginBottom="2">
            FAQ
          </Heading>
          <FaqAccordion title="How long is an SSL Certificate valid for?">
            <Text>
              Let's Encrypt certificates are valid for 90 days, as mentioned on their&nbsp;
              <Link href="https://students.senecacollege.ca/spaces/190/support/wiki/view/1473/contact-its">
                website
              </Link>
            </Text>
          </FaqAccordion>
          <FaqAccordion title="Can I use a single SSL Certificate for multiple dns-records?">
            <Text>
              The certificate that has been issued covers all&nbsp;
              <Link as={RemixLink} to="/dns-records/instructions">
                dns-records
              </Link>
              &nbsp;that you have in&nbsp;
              <Link as={RemixLink} to="/dns-records">
                DNS record table
              </Link>
            </Text>
          </FaqAccordion>
          <FaqAccordion title="What is a Certificate Authority?">
            <Text>
              They are responsible for issuing digital certificates, acting as a reliable
              intermediary in the process of verifying both the owner's identity and dns-record
              ownership prior to issuance. This essential role they play helps to foster trust and
              maintain secure connections between users and various online services. Your
              certificate will be monitored by&nbsp;
              <Link href="https://letsencrypt.org">Let's Encrypt</Link>
            </Text>
          </FaqAccordion>
          <FaqAccordion title="How do I know if my certificate is expiring?">
            On the certificate page, you'll noticed that the "renew certificate" button is currently
            disabled. Rest assured, as the expiration date approaches within 30 days, the button
            will be activated, allowing you to request a new certificate to maintain your online
            security.
          </FaqAccordion>
        </Accordion>
      </Box>
    </Flex>
  );
}
