import { Divider, TabPanel, Text, Link } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface NginxPanelProps {
  fullChain: string;
  privateKey: string;
}

export default function NginxPanel({ fullChain, privateKey }: NginxPanelProps) {
  return (
    <TabPanel>
      <Text marginBottom={4}>
        You can use your certificate with{' '}
        <Link
          href="https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/"
          isExternal
        >
          NGINX to create a secure HTTPS server
        </Link>
        .
      </Text>

      <CertificateDisplay
        title="Full Chain"
        value={fullChain}
        description="Your Public Certificate combined with the Let's Encrypt intermediate certificate chain into a single certificate."
        pathname="cert"
      />
      <Divider />
      <CertificateDisplay
        title="Private Key"
        value={privateKey}
        description="Private certificate key, do not share it."
        pathname="privkey"
      />
    </TabPanel>
  );
}
