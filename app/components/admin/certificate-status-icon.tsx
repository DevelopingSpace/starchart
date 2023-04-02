import { Icon, Text } from '@chakra-ui/react';
import { GrCertificate, GrDocumentTime, GrDocumentMissing } from 'react-icons/gr';

import { CertificateStatus } from '@prisma/client';

interface CertificateStatusIconProps {
  status?: CertificateStatus;
}

export default function CertificateStatusIcon({ status }: CertificateStatusIconProps) {
  switch (status) {
    case CertificateStatus.failed:
      return (
        <Text display="flex" title="Certificate failed">
          <Icon as={GrDocumentMissing} boxSize="1.3em" marginRight="16px" /> Failed
        </Text>
      );
    case CertificateStatus.issued:
      return (
        <Text display="flex" title="Certificate issued">
          <Icon as={GrCertificate} boxSize="1.3em" marginRight="16px" /> Issued
        </Text>
      );
    case CertificateStatus.pending:
      return (
        <Text display="flex" title="Certificate pending...">
          <Icon as={GrDocumentTime} boxSize="1.3em" marginRight="16px" /> Pending...
        </Text>
      );
    default:
      return null;
  }
}
