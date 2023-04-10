import { Divider, TabPanel, Text, Link } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface AwsPanelProps {
  certificate: string;
  privateKey: string;
  chain: string;
}

export default function AwsPanel({ certificate, privateKey, chain }: AwsPanelProps) {
  return (
    <TabPanel>
      <Text marginBottom={4}>
        You can{' '}
        <Link
          href="https://docs.aws.amazon.com/acm/latest/userguide/import-certificate-api-cli.html"
          isExternal
        >
          import your certificate
        </Link>{' '}
        into{' '}
        <Link href="https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html" isExternal>
          AWS Certificate Manager
        </Link>{' '}
        and use it with{' '}
        <Link href="https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html" isExternal>
          many AWS services
        </Link>
        .
      </Text>

      <CertificateDisplay
        title="Certificate body"
        value={certificate}
        description="Public certificate body."
        downloadPart="certificate"
      />
      <Divider />
      <CertificateDisplay
        title="Certificate private key"
        value={privateKey}
        description="Private certificate key is a secret, do not share it."
        downloadPart="privateKey"
      />
      <Divider />
      <CertificateDisplay
        title="Certificate chain - optional"
        value={chain}
        description="Certificate chain includes intermediate certificates used to verify and validate your public certificate."
        downloadPart="chain"
      />
    </TabPanel>
  );
}
