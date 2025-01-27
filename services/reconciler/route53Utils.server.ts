import { DnsRecordType } from '@prisma/client';

/**
 * We need to use some special structures when sending / receiving recordSets
 * from Route53
 *
 * https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/ResourceRecordTypes.html#TXTFormat
 *
 * `"String 1" "String 2" "String 3"` where the original value is cut to 255 char long strings
 * Note, TXT records should not include quotation marks
 */

/**
 * in each segment, replace characters that are not between \o040 - \o176
 * use a replace fn, to generate our 3 digit octal codes, i.e., '!' => '\041'
 * \o040 = \d33 = ascii `!` and \o176 = \d126 =  '~'
 * `\` needs to become `\\` and `"` has to be `\"`
 */
const escapeFn = (char: string): string => {
  if (char === '\\') {
    return '\\\\';
  }
  if (char === '"') {
    return '\\"';
  }

  return `\\${char.charCodeAt(0).toString(8).padStart(3, '0')}`;
};

/**
 * convert back the escaped octal values i.e., '\041' => '!'
 * also unescape \ and " characters
 */
const unescapeFn = (_: string, selection: string): string => {
  if (selection === '\\' || selection === '"') {
    return selection;
  }

  return String.fromCharCode(parseInt(selection, 8));
};

export const toRoute53RecordValue = (type: DnsRecordType, value: string): string => {
  if (type !== DnsRecordType.TXT) {
    return value;
  }

  // Create an uninitialized array with the length to hold our split up strings (max 255 chars)
  // eslint-disable-next-line no-new-array
  const segments = new Array(Math.ceil(value.length / 255))
    // Initialize with undefined
    .fill(undefined)
    // Loop through, using the index split out the appropriate parts from the original string
    .map((_, index) => value.substring(index * 255, (index + 1) * 255))
    // escape
    .map((segment) => segment.replace(/([^!-~]|[\\"])/g, escapeFn))
    // add quotation marks around the segments
    .map((segment) => `"${segment}"`);

  // Finally join the segments together with a white space
  return segments.join(' ');
};

export const fromRoute53RecordValue = (type: DnsRecordType, value: string): string => {
  if (type !== DnsRecordType.TXT) {
    return value;
  }

  // Since space characters are octally escaped, I can use whitespace to split
  const segments = value
    .split(' ')
    // Strip out the leading and trailing parenthesis
    .map((segment) => segment.substring(1, segment.length - 1))
    // convert back the escaped octal values i.e., '\041' => '!'
    // also unescape \ and " characters
    .map((segment) => segment.replace(/\\(\d{3}|\\|")/g, unescapeFn));

  return segments.join('');
};
