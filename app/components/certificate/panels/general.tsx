import { Box, Tabs } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface GeneralPanelProps {
  certificate: string;
  privateKey: string;
  chain: string;
  fullChain: string;
}

export default function GeneralPanel({
  certificate,
  privateKey,
  chain,
  fullChain,
}: GeneralPanelProps) {
  return (
    <Tabs.Content value="general">
      <Box>
        <CertificateDisplay
          title="Public Certificate"
          value={certificate}
          description="The public certificate is intended to be shared widely and is used for encrypting data. The encrypted data can then only be decrypted by the corresponding private key. In other words, anyone can use the public key to encrypt data, but only the private key can be used to decrypt it."
          downloadPart="certificate"
        />
        <CertificateDisplay
          title="Private Key"
          value={privateKey}
          description="The private key is a secret and is used for decrypting data that has been encrypted using the corresponding public key."
          downloadPart="privateKey"
        />
        <CertificateDisplay
          title="Intermediate Chain"
          value={chain}
          description="The intermediate chain is a list of one or more additional certificates that connect the certificate back to the Certificate Authority which issued the certificate."
          downloadPart="chain"
        />
        <CertificateDisplay
          title="Full Chain"
          value={fullChain}
          description="The full chain, also known as the certificate bundle, combines the public certificate with the intermediate chain."
          downloadPart="fullChain"
        />
      </Box>
    </Tabs.Content>
  );
}
