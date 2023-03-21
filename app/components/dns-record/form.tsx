import { AddIcon, InfoIcon, EditIcon } from '@chakra-ui/icons';
import {
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  Textarea,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import type { DnsRecord } from '@prisma/client';
import { useUser } from '~/utils';
import FormField from './form-field';
import { useMemo } from 'react';

type FormMode = 'CREATE' | 'EDIT';

interface dnsRecordFormProps {
  mode: FormMode;
  typeError?: string; // Error for 'Type' field
  dnsRecord?: DnsRecord;
}

export default function DnsRecordForm({ typeError, dnsRecord, mode }: dnsRecordFormProps) {
  const user = useUser();

  const submitButtonText = useMemo(() => (mode === 'CREATE' ? 'Create' : 'Update'), [mode]);
  const SubmitButtonIcon = useMemo(() => (mode === 'CREATE' ? AddIcon : EditIcon), [mode]);

  return (
    <Form className="dns-record-form" method="post">
      <VStack maxW="xl" spacing="2">
        <FormField label="DNS Record Name" isRequired={true}>
          <InputGroup>
            <Input name="subdomain" defaultValue={dnsRecord?.subdomain} />
            <InputRightAddon children={`.${user.baseDomain}`} />
          </InputGroup>
          <Tooltip label="Enter a name for the DNS Record: name">
            <InfoIcon color="#d9d9d9" fontSize="xl" />
          </Tooltip>
        </FormField>

        <FormField label="Type" isRequired={true} error={typeError}>
          <Select placeholder="Select a type" name="type" defaultValue={dnsRecord?.type}>
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
            <option value="CNAME">CNAME</option>
            <option value="TXT">TXT</option>
          </Select>
          <Tooltip label="Select DNS Record type">
            <InfoIcon />
          </Tooltip>
        </FormField>

        <FormField label="Value" isRequired={true}>
          <Input name="value" defaultValue={dnsRecord?.value} />
          <Tooltip label="Enter DNS Record value">
            <InfoIcon />
          </Tooltip>
        </FormField>

        <FormField label="Ports">
          <Input name="ports" defaultValue={dnsRecord?.ports ?? ''} />
          <Tooltip label="Enter port(s) separated by commas (E.g. 8080, 1234)">
            <InfoIcon />
          </Tooltip>
        </FormField>

        <FormField label="Course">
          <Input name="course" />
          <Tooltip label="Enter course name (E.g. OSD700)">
            <InfoIcon />
          </Tooltip>
        </FormField>

        <FormField label="Description">
          <Textarea rows={10} name="description" defaultValue={dnsRecord?.description ?? ''} />
        </FormField>
      </VStack>
      {dnsRecord && <input type="hidden" name="id" value={dnsRecord.id} />}
      <Button type="submit" mt="6" rightIcon={<SubmitButtonIcon boxSize={3.5} mt="0.15rem" />}>
        {submitButtonText}
      </Button>
    </Form>
  );
}
