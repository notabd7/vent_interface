import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Function to create email with attachment using RFC822 format
const createEmail = async ({ to, subject, messageText, attachmentInfo }) => {
  const boundary = 'foo_bar_baz';
  const emailLines = [
    'MIME-Version: 1.0',
    `From: me`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    messageText,
    ''
  ];

  if (attachmentInfo) {
    try {
      const fullPath = path.join(process.cwd(), 'public', attachmentInfo.path);
      console.log('Reading attachment from:', fullPath);
      
      const attachment = await fs.promises.readFile(fullPath);
      const base64Attachment = attachment.toString('base64');

      emailLines.push(`--${boundary}`);
      emailLines.push('Content-Type: application/octet-stream');
      emailLines.push('Content-Transfer-Encoding: base64');
      emailLines.push(`Content-Disposition: attachment; filename="${attachmentInfo.name}"`);
      emailLines.push('');
      emailLines.push(base64Attachment);
    } catch (error) {
      console.error('Error reading attachment:', error);
      throw new Error(`Failed to read attachment: ${error.message}`);
    }
  }

  emailLines.push(`--${boundary}--`);

  // Convert to base64url encoding
  return Buffer.from(emailLines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export async function POST(request) {
  const { type, emailData, tokens } = await request.json();

  switch (type) {
    case 'getAuthUrl':
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
      });
      return NextResponse.json({ url });

    case 'getToken':
      try {
        const { code } = emailData;
        const { tokens } = await oauth2Client.getToken(code);
        return NextResponse.json({ tokens });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

    case 'sendEmail':
      try {
        oauth2Client.setCredentials(tokens);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        console.log('Creating email with config:', emailData);
        const raw = await createEmail(emailData);

        // Using the upload endpoint
        const response = await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
          uploadType: 'media',
          media: {
            mimeType: 'message/rfc822',
            body: raw
          }
        });

        console.log('Email sent successfully:', response.data);

        return NextResponse.json({ 
          success: true, 
          messageId: response.data.id,
          threadId: response.data.threadId
        });

      } catch (error) {
        console.error('Send email error:', error);
        return NextResponse.json({ 
          error: error.message,
          details: error.response?.data?.error || 'No additional details'
        }, { status: 500 });
      }

    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
}