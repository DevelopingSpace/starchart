import { Tabs, Text, Link, Box } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface NodePanelProps {
  certificate: string;
  privateKey: string;
  chain: string;
}

export default function NodePanel({ certificate, privateKey, chain }: NodePanelProps) {
  return (
    <Tabs.Content value="node">
      <Text marginBottom={4}>
        You can use your certificate with{' '}
        <Link
          href="https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener"
          target="_blank"
          rel="noopener noreferrer"
        >
          Node.js to create a secure HTTPS server
        </Link>
        .
      </Text>

      <Box divideX="2px">
        <CertificateDisplay
          title="Cert"
          value={certificate}
          description="Public certificate."
          downloadPart="certificate"
        />

        <CertificateDisplay
          title="Key"
          value={privateKey}
          description="Private certificate key, do not share it."
          downloadPart="privateKey"
        />

        <CertificateDisplay
          title="CA - optional"
          value={chain}
          description="The CA Bundle."
          downloadPart="chain"
        />
      </Box>
    </Tabs.Content>
  );
}
