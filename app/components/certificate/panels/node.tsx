import { Divider, TabPanel, Text, Link } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface NodePanelProps {
  publicKey: string;
  privateKey: string;
}

export default function NodePanel({ publicKey, privateKey }: NodePanelProps) {
  return (
    <TabPanel>
      <Text marginBottom={4}>
        You can use your certificate with{' '}
        <Link
          href="https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener"
          isExternal
        >
          Node.js to create a secure HTTPS server
        </Link>
        .
      </Text>

      <CertificateDisplay
        title="Cert"
        value={publicKey}
        description="Public certificate."
        pathname="cert"
      />
      <Divider />
      <CertificateDisplay
        title="Key"
        value={privateKey}
        description="Private certificate key, do not share it."
        pathname="privkey"
      />
      <Divider />
      <CertificateDisplay
        title="CA - optional"
        value={publicKey}
        description="The CA Bundle."
        pathname="cert"
      />
    </TabPanel>
  );
}
