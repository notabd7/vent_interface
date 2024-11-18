'use client'
import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailInterface = () => {
  const [status, setStatus] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const tokens = localStorage.getItem('gmailTokens');
    if (tokens) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'getAuthUrl' }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setStatus('Error getting auth URL');
    }
  };

  const handleSendEmail = async (type) => {
    setStatus(`Sending ${type} email...`);
    try {
      const tokens = JSON.parse(localStorage.getItem('gmailTokens') || '{}');
      
      // Configure email based on type
      let emailConfig = {
        to: 'rha35@drexel.edu',
        //to: 'data@sbd.iridium.com',
        type: type
      };

      // Specific configuration for each type
      switch(type) {
        case 'open':
          emailConfig = {
            ...emailConfig,
            subject: '300534064701730',
            messageText: '',
            attachmentInfo: {
              path: '../public/commands/011.sbd',
              name: '011.sbd'
            }
          };
          break;
        case 'close':
          emailConfig = {
            ...emailConfig,
            subject: '300534064701730',
            messageText: '',
            attachmentInfo: {
              path: '../public/commands/100.sbd',
              name: '100.sbd'
            }
          };
          break;
        case 'idle':
          emailConfig = {
            ...emailConfig,
            subject: '300534064701730',
            messageText: '',
            attachmentInfo: {
              path: '../public/commands/000.sbd',
              name: '000.sbd'
            }
          };
          break;
        case 'cutdown':
          emailConfig = {
            ...emailConfig,
            subject: '300534064701730',
            messageText: '',
            attachmentInfo: {
              path: '../public/commands/001.sbd',
              name: '001.sbd'
            }
          };
          break;
        default:
          emailConfig = {
            ...emailConfig,
            subject: `${type.toUpperCase()} Email`,
            messageText: `This is a ${type} email.`
          };
      }

      const response = await fetch('/api/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sendEmail',
          tokens,
          emailData: emailConfig,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setStatus(`${type} email sent successfully!`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setStatus(`Error sending ${type} email: ${error.message}`);
    }
  };

  const buttons = [
    { name: 'Open', variant: 'default' },
    { name: 'Close', variant: 'default' },
    { name: 'Idle', variant: 'default' },
    { name: 'Cutdown', variant: 'default' }
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          DevilDragon Vent Interface
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <Button onClick={handleAuth} className="w-full">
            Connect with Gmail
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {buttons.map((button) => (
              <Button
                key={button.name}
                variant={button.variant}
                className="w-full"
                onClick={() => handleSendEmail(button.name.toLowerCase())}
              >
                Send {button.name}
              </Button>
            ))}
          </div>
        )}
        
        {status && (
          <Alert className="mt-4">
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailInterface;