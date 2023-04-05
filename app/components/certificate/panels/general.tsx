import { Divider, TabPanel } from '@chakra-ui/react';
import CertificateDisplay from '../certificate-display';

interface GeneralPanelProps {
  publicKey: string;
  privateKey: string;
}

export default function GeneralPanel({ publicKey, privateKey }: GeneralPanelProps) {
  return (
    <TabPanel>
      <CertificateDisplay
        title="Public Key"
        value={publicKey}
        description="Public key is intended to be shared widely and is used for encrypting data. The encrypted data can then only be decrypted by the corresponding private key. In other words, anyone can use the public key to encrypt data, but only the private key can be used to decrypt it."
        pathname="cert"
      />
      <Divider />
      <CertificateDisplay
        title="Private Key"
        value={privateKey}
        description="Private key is a secret and is used for decrypting data that has been encrypted using the corresponding public key."
        pathname="privkey"
      />
    </TabPanel>
  );
}
