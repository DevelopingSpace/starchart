import { Divider } from '@chakra-ui/react';

import Description from './description';
import CertificateDisplay from './certificate-display';

interface CertificateAvailableProps {
  validFromFormatted: string;
  validToFormatted: string;
  publicKey: string;
  privateKey: string;
}

export default function CertificateAvailable({
  validFromFormatted,
  validToFormatted,
  publicKey,
  privateKey,
}: CertificateAvailableProps) {
  return (
    <>
      <Description
        description="With this certificate, you will have an HTTPS certificate for all of your projects connected to your DNS records."
        certRequested={true}
        validFromFormatted={validFromFormatted}
        validToFormatted={validToFormatted}
      />
      <Divider />
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
    </>
  );
}
