import { Divider } from '@chakra-ui/react';

import Description from './description';
import CertificateDisplay from './certificate-display';

interface CertificateAvailableProps {
  validFrom: Date;
  validTo: Date;
  publicKey: string;
  privateKey: string;
}

export default function CertificateAvailable({
  validFrom,
  validTo,
  publicKey,
  privateKey,
}: CertificateAvailableProps) {
  return (
    <>
      <Description
        description="Certificate: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        certRequested={true}
        validFrom={validFrom}
        validTo={validTo}
      />
      <Divider />
      <CertificateDisplay
        title="Public Key"
        value={publicKey}
        description="Public: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
      />
      <Divider />
      <CertificateDisplay
        title="Private Key"
        value={privateKey}
        description="Private: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
      />
    </>
  );
}
