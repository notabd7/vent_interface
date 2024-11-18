'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      if (code) {
        try {
          // Exchange code for tokens
          const response = await fetch('/api/gmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'getToken',
              emailData: { code }
            }),
          });

          const data = await response.json();
          if (data.tokens) {
            // Store tokens in localStorage
            localStorage.setItem('gmailTokens', JSON.stringify(data.tokens));
            router.push('/');
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return <div>Processing authentication...</div>;
}