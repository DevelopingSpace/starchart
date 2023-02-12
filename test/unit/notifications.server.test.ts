import sendNotification from '../../app/lib/notifications.server';

const { NOTIFICATIONS_EMAIL_USER } = process.env;

describe('Notification server lib function test', () => {
  const recipient = 'dev@starchart.invalid';
  const subject = 'Sample subject';
  const text = 'Sample text';

  test('sending and receiving email notification using sendNotification()', async () => {
    const sentMailResponse = await sendNotification(recipient, subject, text);

    let messageId = sentMailResponse?.messageId;

    expect(sentMailResponse).toEqual(
      expect.objectContaining({
        accepted: expect.arrayContaining([recipient]),
      })
    );

    const mailhogResponse = await fetch(
      `http://localhost:8025/api/v2/search?kind=to&query=${recipient}`
    );
    const responseToJSON = await mailhogResponse.json();
    expect(responseToJSON.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Content: expect.objectContaining({
            Headers: expect.objectContaining({
              'Message-ID': expect.arrayContaining([messageId]),
              'To': expect.arrayContaining([recipient]),
              'From': expect.arrayContaining([NOTIFICATIONS_EMAIL_USER]),
            }),
            Body: expect.stringMatching(text),
          }),
        }),
      ])
    );
  });
});
