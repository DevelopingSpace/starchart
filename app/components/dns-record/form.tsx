import { AddIcon, EditIcon } from '@chakra-ui/icons';
import {
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { Form } from '@remix-run/react';
import type { DnsRecord } from '@prisma/client';
import { useEffectiveUser } from '~/utils';
import FormField from './form-field';
import { useMemo } from 'react';
import type { z } from 'zod';

type FormMode = 'CREATE' | 'EDIT';

interface dnsRecordFormProps {
  mode: FormMode;
  dnsRecord?: DnsRecord;
  errors?: z.typeToFlattenedError<DnsRecord>;
}

export default function DnsRecordForm({ dnsRecord, mode, errors }: dnsRecordFormProps) {
  const user = useEffectiveUser();

  const submitButtonText = useMemo(() => (mode === 'CREATE' ? 'Create' : 'Update'), [mode]);
  const SubmitButtonIcon = useMemo(() => (mode === 'CREATE' ? AddIcon : EditIcon), [mode]);

  return (
    <Form className="dns-record-form" method="post">
      <VStack maxW="xl" spacing="6">
        <FormField
          label="Name"
          isRequired={true}
          error={errors?.fieldErrors.subdomain?.join(' ')}
          helpText="DNS Record Names can contain lowercase letters (a-z), numbers (0-9), and - or _"
        >
          <InputGroup>
            <Input name="subdomain" defaultValue={dnsRecord?.subdomain} />
            <InputRightAddon children={`.${user.baseDomain}`} />
          </InputGroup>
        </FormField>

        <FormField
          label="Type"
          isRequired={true}
          helpText="DNS Record Type (IPv4, IPv6, Domain Name, Text) indicates what Value will be"
          error={errors?.fieldErrors.type?.join(' ')}
        >
          <Select placeholder="Select a type" name="type" defaultValue={dnsRecord?.type}>
            <option value="A">A Record (IPv4 Address)</option>
            <option value="AAAA">AAAA Record (IPv6 Address)</option>
            <option value="CNAME">CNAME Record (Domain Name)</option>
            <option value="TXT">TXT Record (Text Value)</option>
          </Select>
        </FormField>

        <FormField
          label="Value"
          isRequired={true}
          helpText="Value must match Type: A=IPv4, AAAA=IPv6, CNAME=domain.com, TXT=any text..."
          error={errors?.fieldErrors.value?.join(' ')}
        >
          <Input name="value" defaultValue={dnsRecord?.value} />
        </FormField>

        <FormField
          label="Ports"
          helpText="Enter one or more Ports in use, separated by comma (e.g., 8080, 1234)"
          error={errors?.fieldErrors.ports?.join(' ')}
        >
          <Input name="ports" defaultValue={dnsRecord?.ports ?? ''} />
        </FormField>

        <FormField
          label="Course"
          helpText="Course name using this DNS Record (e.g., OSD700)"
          error={errors?.fieldErrors.course?.join(' ')}
        >
          <Input name="course" defaultValue={dnsRecord?.course ?? ''} />
        </FormField>

        <FormField label="Description" error={errors?.fieldErrors.description?.join(' ')}>
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
