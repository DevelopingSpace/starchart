import { Flex, IconButton, Text, Tooltip, useToast } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { Form } from '@remix-run/react';

import type { DnsRecord } from '@prisma/client';

interface DnsRecordNameProps {
  dnsRecord: DnsRecord;
}

const DnsRecordExpiryDate = ({ dnsRecord }: DnsRecordNameProps) => {
  const toast = useToast();

  return (
    <Flex alignItems="center">
      <Text>{dnsRecord.expiresAt.toLocaleDateString('en-US')}</Text>
      <Form method="patch" style={{ margin: 0 }}>
        <input type="hidden" name="id" value={dnsRecord.id} />
        <input type="hidden" name="intent" value="renew-dns-record" />
        <Tooltip label="Renew DNS record">
          <IconButton
            icon={<RepeatIcon color="black" boxSize="5" />}
            aria-label="Refresh DNS record"
            variant="ghost"
            type="submit"
            onClick={() =>
              toast({
                title: `DNS Record "${dnsRecord.subdomain}" has been successfully renewed`,
                position: 'bottom-right',
                status: 'success',
              })
            }
          />
        </Tooltip>
      </Form>
    </Flex>
  );
};

export default DnsRecordExpiryDate;
