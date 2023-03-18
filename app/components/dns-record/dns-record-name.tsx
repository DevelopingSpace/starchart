import { Flex, Text } from '@chakra-ui/react';

interface DnsRecordNameProps {
  subdomain: string;
  basedomain: string;
}

const DnsRecordName = ({ subdomain, basedomain }: DnsRecordNameProps) => {
  return (
    <Flex alignItems="flex-end" flexDirection="row">
      <Text>
        <Text as="span" sx={{ fontWeight: 'medium' }}>
          {subdomain}
        </Text>
        <Text as="span" color="gray.500">
          .{basedomain}
        </Text>
      </Text>
    </Flex>
  );
};

export default DnsRecordName;
