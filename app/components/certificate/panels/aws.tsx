import { Tabs, Text, Link, Box } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface AwsPanelProps {
  certificate: string;
  privateKey: string;
  chain: string;
}

export default function AwsPanel({ certificate, privateKey, chain }: AwsPanelProps) {
  return (
    <Tabs.Content value="aws">
      <Text marginBottom={4}>
        You can{' '}
        <Link
          href="https://docs.aws.amazon.com/acm/latest/userguide/import-certificate-api-cli.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          import your certificate
        </Link>{' '}
        into{' '}
        <Link
          href="https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          AWS Certificate Manager
        </Link>{' '}
        and use it with{' '}
        <Link
          href="https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          many AWS services
        </Link>
        .
      </Text>

      <Box divideX="2px">
        <CertificateDisplay
          title="Certificate body"
          value={certificate}
          description="Public certificate body."
          downloadPart="certificate"
        />
        <CertificateDisplay
          title="Certificate private key"
          value={privateKey}
          description="Private certificate key is a secret, do not share it."
          downloadPart="privateKey"
        />
        <CertificateDisplay
          title="Certificate chain - optional"
          value={chain}
          description="Certificate chain includes intermediate certificates used to verify and validate your public certificate."
          downloadPart="chain"
        />
      </Box>
    </Tabs.Content>
  );
}
