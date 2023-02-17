import { Input, Select, VStack } from '@chakra-ui/react';

export default function DomainForm() {
  return (
    <VStack maxW="lg" spacing="5">
      <Input placeholder="Domain Name" />
      <Select placeholder="Types">
        <option value="cname">CNAME</option>
      </Select>
      <Input placeholder="Value" />
      <Input placeholder="Ports" />
      <Input placeholder="Course" />
    </VStack>
  );
}
