import { createTransport, type SendMailOptions } from 'nodemailer';
import { secrets } from 'docker-secret';
import logger from './logger.server';

const { NODEMAILER_USER } = process.env;
const { NODEMAILER_CLIENT_ID, NODEMAILER_ACCESS_TOKEN } = secrets ?? {};

const initializeTransport = () => {
  if (!NODEMAILER_USER || !NODEMAILER_CLIENT_ID || !NODEMAILER_ACCESS_TOKEN) {
    throw new Error(
      'Missing Nodemailer environment variables or docker secrets. Skipping nodemailer configuration'
    );
  }
  const transporter = createTransport({
    service: 'Outlook365',
    auth: {
      type: 'OAuth2',
      user: NODEMAILER_USER, // email address for notifications
      clientId: NODEMAILER_CLIENT_ID,
      accessToken: NODEMAILER_ACCESS_TOKEN,
    },
  });
  return transporter;
};

const send = async (data: SendMailOptions) => {
  try {
    const transport = initializeTransport();
    logger.debug('Sending notification', data);
    return await transport.sendMail(data);
  } catch (error) {
    logger.warn('Unable to send notification', error);
  }
};

export default send;
