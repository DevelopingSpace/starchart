import { Divider, TabPanel, Text, Link } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface AwsPanelProps {
  publicKey: string;
  privateKey: string;
}

export default function AwsPanel({ publicKey, privateKey }: AwsPanelProps) {
  return (
    <TabPanel>
      <Text marginBottom={4}>
        You can{' '}
        <Link
          href="https://docs.aws.amazon.com/acm/latest/userguide/import-certificate-api-cli.html"
          isExternal
        >
          import your certificate
        </Link>
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
        value={publicKey}
        description="Public certificate body."
        pathname="cert"
      />
      <Divider />
      <CertificateDisplay
        title="Certificate private key"
        value={privateKey}
        description="Private certificate key is a secret, do not share it."
        pathname="privkey"
      />
      <Divider />
      <CertificateDisplay
        title="Certificate chain - optional"
        value={publicKey}
        description="Certificate chain includes intermediate certificates used to verify and validate your public certificate."
        pathname="privkey"
      />
    </TabPanel>
  );
}
