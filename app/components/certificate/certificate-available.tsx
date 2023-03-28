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
        description="Certificate: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        certRequested={true}
        validFromFormatted={validFromFormatted}
        validToFormatted={validToFormatted}
      />
      <Divider />
      <CertificateDisplay
        title="Public Key"
        value={publicKey}
        description="Public: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        pathname="cert"
      />
      <Divider />
      <CertificateDisplay
        title="Private Key"
        value={privateKey}
        description="Private: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        pathname="privkey"
      />
    </>
  );
}
