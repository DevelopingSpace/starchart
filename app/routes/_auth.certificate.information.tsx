import { Heading, Text, Link, Box, Tabs, Accordion, Flex, List } from '@chakra-ui/react';
import { Link as RemixLink } from '@remix-run/react';
import { LockIcon } from '@chakra-ui/icons';

import FaqAccordion from '~/components/instructions/faq-accordion';

export default function CertificateInstructionsRoute() {
  return (
    <Flex flexDirection="column" paddingBottom="20" maxWidth={750}>
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }} mb="4">
        SSL Certificates
      </Heading>
      <Box>
        <Heading as="h2" size="md" marginTop="5">
          What is an SSL Certificate?
        </Heading>
        <Text marginY={4}>
          When browsing the internet, you may have noticed a padlock (
          <LockIcon boxSize="3" marginBottom="1" />) symbol next to the website's URL. This padlock
          indicates whether the website has a valid SSL/TLS certificate or not. These certificates
          are used to secure websites, encrypting and decrypting data exchanged between clients and
          servers.
        </Text>
        <Text marginY={4}>
          An SSL/TLS Certificate is like a digital lock that keeps information exchanged between
          your computer and a website private and secure. It helps protect your private or sensitive
          information (e.g., credit card numbers, login credentials, etc.) from being intercepted by
          hackers or cybercriminals.
        </Text>
        <Text marginY={4}>
          Unfortunately, there are malicious websites that do not provide any security and cannot
          prove their identity to your web browser. To ensure your safety while browsing the
          internet, modern browsers automatically block access to such sites that could harm your
          computer. For example, opening an HTTP URL with an expired or misconfigured certificate
          will result in a warning, as illustrated&nbsp;
          <Link href="https://expired-rsa-dv.ssl.com" target="_blank">
            here
          </Link>
          .
        </Text>
        <Text marginY={4}>
          When a website has an SSL certificate, you'll see a padlock icon and the web address
          changes from "http" to "https" in your browser's address bar. This means that the
          connection between your computer and the website is encrypted and secure.
        </Text>
        <Text marginY={4}>
          SSL certificates are essential for websites that collect sensitive information from users,
          like online stores, banks, or any site that requires you to enter personal information.
          They help build trust between websites and their users and ensure that your data is kept
          private and secure.
        </Text>

        <Heading as="h3" size="md" marginTop="5">
          How to Request a Certificate
        </Heading>
        <List.Root as="ol" listStylePos="inside" marginTop="3">
          <Box pt="2" pb="2">
            <List.Item>
              Go to the&nbsp;
              <Link asChild>
                <RemixLink to="/certificate">Certificate Page</RemixLink>
              </Link>
            </List.Item>
            <List.Item>
              Click the <strong>Request a Certificate</strong> button
            </List.Item>
            <List.Item>
              You will be greeted with a loading page, and will receive an email once your
              certificate has been issued or fails to be issued.
            </List.Item>
          </Box>

          <Text>
            You can check if your DNS Records have a valid certificate by using an&nbsp;
            <Link href="https://www.sslshopper.com/ssl-checker.html" target="_blank">
              SSL Checker Tool
            </Link>
            .
          </Text>
        </List.Root>

        <Heading as="h3" size="md" marginTop="5">
          Types of Certificates
        </Heading>
        <Text marginTop="3">
          Once you have obtained a certificate, you are granted the authority to use it for specific
          services. The certificate consists of four <code>.pem</code> files, and not every service
          requires the same ones:
        </Text>

        <Tabs.Root marginY="3" defaultValue="public-certificate" fitted>
          <Tabs.List>
            <Tabs.Trigger value="public-certificate">Public Certificate</Tabs.Trigger>
            <Tabs.Trigger value="private-key">Private Key</Tabs.Trigger>
            <Tabs.Trigger value="intermediate-chain">Intermediate Chain</Tabs.Trigger>
            <Tabs.Trigger value="full-chain">Full Chain</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="public-certificate">
            <Text>
              A digital document that proves the identity of an entity, such as a user or
              organization, and establishes a secure connection between their web browser and a
              website or server. It uses a pair of encryption keys, one public and one private, and
              is issued by a trusted third party called a certification authority. For more
              information&nbsp;
              <Link
                href="https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/"
                target="_blank"
              >
                click here
              </Link>
              .
            </Text>
          </Tabs.Content>
          <Tabs.Content value="private-key">
            <Text>
              Used to decrypt data that has been encrypted with the corresponding public key, and to
              digitally sign documents or messages. For more information&nbsp;
              <Link
                href="https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/"
                target="_blank"
              >
                click here
              </Link>
            </Text>
          </Tabs.Content>
          <Tabs.Content value="intermediate-chain">
            <Text>
              A set of certificates that are used to verify the authenticity of an SSL/TLS
              certificate. They serve as a bridge between the SSL/TLS certificate and the root
              Certificate Authority (CA) to establish a chain of trust, ensuring that the SSL/TLS
              certificate is valid and secure. For more information&nbsp;
              <Link
                href="https://support.dnsimple.com/articles/what-is-ssl-certificate-chain/"
                target="_blank"
              >
                click here
              </Link>
            </Text>
          </Tabs.Content>
          <Tabs.Content value="full-chain">
            A file that combines an SSL certificate (Public Certificate) with its intermediate
            certificates, creating a trust connection between a server and a client. In simpler
            terms, it makes sure online communication is secure and trustworthy.
          </Tabs.Content>
        </Tabs.Root>

        <Accordion.Root multiple>
          <Heading as="h3" size="md" marginBottom="2">
            FAQ
          </Heading>
          <FaqAccordion title="How long is an SSL Certificate valid for?">
            <Text>
              Let's Encrypt certificates are valid for 90 days, as mentioned on their&nbsp;
              <Link
                href="https://letsencrypt.org/docs/faq/#:~:text=Our%20certificates%20are%20valid%20for,your%20certificates%20every%2060%20days."
                target="_blank"
              >
                website
              </Link>
            </Text>
          </FaqAccordion>
          <FaqAccordion title="Can I use a single SSL Certificate for multiple DNS Records?">
            <Text>
              The certificate that has been issued covers all&nbsp;
              <Link asChild>
                <RemixLink to="/dns-records/instructions">DNS Records</RemixLink>
              </Link>
              &nbsp;that you have in the&nbsp;
              <Link asChild>
                <RemixLink to="/dns-records">DNS records table</RemixLink>
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
              <Link href="https://letsencrypt.org" target="_blank">
                Let's Encrypt
              </Link>
            </Text>
          </FaqAccordion>
          <FaqAccordion title="How do I know if my certificate is expiring?">
            On the certificate page, you'll noticed that the "renew certificate" button is currently
            disabled. Rest assured, as the expiration date approaches within 30 days, the button
            will be activated, allowing you to request a new certificate to maintain your online
            security.
          </FaqAccordion>
        </Accordion.Root>
      </Box>
    </Flex>
  );
}
