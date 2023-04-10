import { Divider, TabPanel, Text, Link } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface NodePanelProps {
  certificate: string;
  privateKey: string;
  chain: string;
}

export default function NodePanel({ certificate, privateKey, chain }: NodePanelProps) {
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
        value={certificate}
        description="Public certificate."
        downloadPart="certificate"
      />
      <Divider />
      <CertificateDisplay
        title="Key"
        value={privateKey}
        description="Private certificate key, do not share it."
        downloadPart="privateKey"
      />
      <Divider />
      <CertificateDisplay
        title="CA - optional"
        value={chain}
        description="The CA Bundle."
        downloadPart="chain"
      />
    </TabPanel>
  );
}
