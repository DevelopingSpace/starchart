import { Flex, Center } from '@chakra-ui/react';
import type { Certificate } from '@prisma/client';
import { useState } from 'react';

import undrawSvg from '~/assets/undraw_processing_re_tbdu.svg';
import Loading from '~/components/display-page';
import CertificateAvailable from '~/components/certificate/certificate-available';
import CertificateRequestView from '~/components/certificate/certificate-request';

export default function CertificateIndexRoute() {
  const [certificateRequested, setCertificateRequested] = useState(true);
  const [loading, setLoading] = useState(false);

  const currentDate: Date = new Date(2023, 2);

  const certificate: Certificate = {
    id: 1,
    username: 'user_test',
    domain: `user_test.example.com`,
    status: 'issued',
    certificate:
      'Public----BEGIN CERTIFICATE-----MIIFMjCCAxoCCQCVordquLnq8TANBgkqhkiG9w0BAQUFADBbMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRQwEgYDVQQDEwtleGFtcGxlLmNvbTAeFw0xNzA5MTQxNDMzMTRaFw0xODA5MTQxNDMzMTRaMFsxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQxFDASBgNVBAMTC2V4YW1wbGUuY29tMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwi2PYBNGl1n78niRGDKgcsWK03TcTeVbQ1HztA57Rr1iDHAZNx3Mv4E/Sha8VKbKoshcmUcOS3AlmbIZX+7+9c7lL2oD+vtUZF1YUR/69fWuO72wk6fKj/eofxH9Ud5KFje8qrYZdJWKkPMdWlYgjD6qpA5wl60NiuxmUr44ADZDytqHzNThN3wrFruz74PcMfakcSUMxkh98LuNeGtqHpEAw+wliko3oDD4PanvDvp5mRgiQVKHEGT7dm85Up+W1iJKJ65fkc/j940MaLbdISZYYCT5dtPgCGKCHgVuVrY+OXFJrD3TTm94ILsR/BkS/VSKNigGVPXg3q8tgIS++k13CzLUO0PNRMuod1RD9j5NEc2CVic9rcH06ugZyHlOcuVvvRsPGd52BPn+Jf1aePKPPQHxT9i5GOs80CJw0eduZCDZB32biRYNwUtjFkHbu8ii2IGkvhnWonjd4w5wOldG+RPr+XoFCIaHp5TszQ+HnUTLIXKtBgzzCKjK4eZqrck7xpo5B5m5V7EUxBze2LYVky+GsDsqL8CggQqJL4ZKuZVoxgPwhnDy5nMs057NCU9EnXcauMW9UEqEHu5NXnmGJrCvQ56wjYN3lgvCHEtmIpsRjCCWaBJYiawu1J5ZAf1yGTVNh8pEvO//zL9ImUxrSfOGUeFiN1tzSFlTfbcCAwEAATANBgkqhkiG9w0BAQUFAAOCAgEAdZZpgWv79CgF5ny6HmMaYgsXJKJyQE9RhJ1cmzDY8KAF+nzT7q4Pgt3WbA9bpdji7C0WqKjX7hLipqhgFnqb8qZcodEKhX788qBj4X45+4nT6QipyJlz5x6KcCn/v9gQNKks7U+dBlqquiVfbXaa1EAKMeGtqinf+Y51nR/fBcr/P9TBnSJqH61KDO3qrE5KGTwHQ9VXoeKyeppGt5sYf8G0vwoHhtPTOO8TuLEIlFcXtzbC3zAtmQj6Su//fI5yjuYTkiayxMx8nCGrQhQSXdC8gYpYd0os7UY01DVu4BTCXEvf0GYXtiGJeG8lQT/eu7WdK83uJ93U/BMYzoq4lSVcqY4LNxlfAQXKhaAbioA5XyT7co7FQ0g+s2CGBUKa11wPDe8M2GVLPsxT2bXDQap5DQyVIuTwjtgL0tykGxPJPAnL2zuUy6T3/YzrWaJ9Os+6mUCVdLnXtDgZ10Ujel7mq6wo9Ns+u07grXZkXpmJYnJXBrwOsY8KZa5vFwgJrDXhWe+Fmgt1EP5VIqRCQAxH2iYvAaELi8udbN/ZiUU3K9t79MP/M3U/tEWAubHXsaAv03jRy43X0VjlZHmagU/4dU7RBWfyuwRarYIXLNT2FCd2z4kd3fsL3rB5iI+RH0uoNuOa1+UApfFCv0O65TYkp5jEWSlU8PhKYD43nXA=-----END CERTIFICATE-----',
    orderUrl: `orderUrl.example.com`,
    privateKey:
      'Private----BEGIN CERTIFICATE-----MIIFMjCCAxoCCQCVordquLnq8TANBgkqhkiG9w0BAQUFADBbMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRQwEgYDVQQDEwtleGFtcGxlLmNvbTAeFw0xNzA5MTQxNDMzMTRaFw0xODA5MTQxNDMzMTRaMFsxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQxFDASBgNVBAMTC2V4YW1wbGUuY29tMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwi2PYBNGl1n78niRGDKgcsWK03TcTeVbQ1HztA57Rr1iDHAZNx3Mv4E/Sha8VKbKoshcmUcOS3AlmbIZX+7+9c7lL2oD+vtUZF1YUR/69fWuO72wk6fKj/eofxH9Ud5KFje8qrYZdJWKkPMdWlYgjD6qpA5wl60NiuxmUr44ADZDytqHzNThN3wrFruz74PcMfakcSUMxkh98LuNeGtqHpEAw+wliko3oDD4PanvDvp5mRgiQVKHEGT7dm85Up+W1iJKJ65fkc/j940MaLbdISZYYCT5dtPgCGKCHgVuVrY+OXFJrD3TTm94ILsR/BkS/VSKNigGVPXg3q8tgIS++k13CzLUO0PNRMuod1RD9j5NEc2CVic9rcH06ugZyHlOcuVvvRsPGd52BPn+Jf1aePKPPQHxT9i5GOs80CJw0eduZCDZB32biRYNwUtjFkHbu8ii2IGkvhnWonjd4w5wOldG+RPr+XoFCIaHp5TszQ+HnUTLIXKtBgzzCKjK4eZqrck7xpo5B5m5V7EUxBze2LYVky+GsDsqL8CggQqJL4ZKuZVoxgPwhnDy5nMs057NCU9EnXcauMW9UEqEHu5NXnmGJrCvQ56wjYN3lgvCHEtmIpsRjCCWaBJYiawu1J5ZAf1yGTVNh8pEvO//zL9ImUxrSfOGUeFiN1tzSFlTfbcCAwEAATANBgkqhkiG9w0BAQUFAAOCAgEAdZZpgWv79CgF5ny6HmMaYgsXJKJyQE9RhJ1cmzDY8KAF+nzT7q4Pgt3WbA9bpdji7C0WqKjX7hLipqhgFnqb8qZcodEKhX788qBj4X45+4nT6QipyJlz5x6KcCn/v9gQNKks7U+dBlqquiVfbXaa1EAKMeGtqinf+Y51nR/fBcr/P9TBnSJqH61KDO3qrE5KGTwHQ9VXoeKyeppGt5sYf8G0vwoHhtPTOO8TuLEIlFcXtzbC3zAtmQj6Su//fI5yjuYTkiayxMx8nCGrQhQSXdC8gYpYd0os7UY01DVu4BTCXEvf0GYXtiGJeG8lQT/eu7WdK83uJ93U/BMYzoq4lSVcqY4LNxlfAQXKhaAbioA5XyT7co7FQ0g+s2CGBUKa11wPDe8M2GVLPsxT2bXDQap5DQyVIuTwjtgL0tykGxPJPAnL2zuUy6T3/YzrWaJ9Os+6mUCVdLnXtDgZ10Ujel7mq6wo9Ns+u07grXZkXpmJYnJXBrwOsY8KZa5vFwgJrDXhWe+Fmgt1EP5VIqRCQAxH2iYvAaELi8udbN/ZiUU3K9t79MP/M3U/tEWAubHXsaAv03jRy43X0VjlZHmagU/4dU7RBWfyuwRarYIXLNT2FCd2z4kd3fsL3rB5iI+RH0uoNuOa1+UApfFCv0O65TYkp5jEWSlU8PhKYD43nXA=-----END CERTIFICATE-----',
    validFrom: currentDate,
    validTo: new Date(currentDate.getFullYear(), currentDate.getMonth() + 6),
  };

  function onRequest() {
    setLoading(true);
    setTimeout(() => {
      setCertificateRequested(true);
      setLoading(false);
    }, 5000);
  }

  function formatDate(val: Date): string {
    let date = val.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    return date;
  }

  if (loading) {
    return (
      <Loading
        img={undrawSvg}
        desc="We have received your request, and will notify you when your certificate is ready"
      />
    );
  }

  return (
    <Center>
      <Flex
        flexDirection="column"
        gap="5"
        width={{ base: 'md', sm: 'lg', md: '2xl', lg: '4xl' }}
        marginTop={{ base: '16', md: '5' }}
      >
        {certificateRequested ? (
          <CertificateAvailable
            publicKey={certificate.certificate!}
            privateKey={certificate.privateKey!}
            validFromFormatted={formatDate(certificate.validFrom!)}
            validToFormatted={formatDate(certificate.validTo!)}
          />
        ) : (
          <CertificateRequestView domain={certificate.domain} onRequest={onRequest} />
        )}
      </Flex>
    </Center>
  );
}
