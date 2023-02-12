import sendNotification from '../../app/lib/notifications.server';

describe('Notification server lib function test', () => {
  const email: string = 'dev@starchart.invalid';
  const subject: string = 'Sample subject';
  const text: string = 'Sample text';

  test('sending email notification using sendNotification() ', async () => {
    const response = await sendNotification(email, subject, text);
    expect(response).toBe(true);
  });

  test('verifying MailHog received test email notification via SendNotification() ', async () => {
    const response = await fetch(`http://localhost:8025/api/v2/search?kind=to&query=${email}`);
    const responseToJSON = await response.json();
    const mostRecentMessage = responseToJSON.items[0].Content;
    const { To, Subject } = mostRecentMessage.Headers;
    const { Body } = mostRecentMessage;
    expect(To[0]).toBe(email);
    expect(Subject[0]).toBe(subject);
    expect(Body).toBe(text);
  });
});
