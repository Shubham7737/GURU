"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID_ENDPOINT = 'http://localhost:3000/api/v1/public/google-client-id';
const GOOGLE_AUTH_ENDPOINT = 'http://localhost:3000/api/v1/auth/google';

const GoogleSignIn = ({ redirectTo = '/dashboard', className = '' }) => {
  const containerRef = useRef(null);
  const [clientId, setClientId] = useState('');
  const { setUser, setToken, setIsLoggedIn } = useAuth();
  const router = useRouter();

  // Helper to load Google's identity script
  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) return resolve();
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(GOOGLE_CLIENT_ID_ENDPOINT);
        const json = await res.json();
        if (!mounted) return;
        setClientId(json.clientId || '');
        if (!json.clientId) return;
        await loadGoogleScript();

        // Initialize and render button
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: json.clientId,
            callback: async (response) => {
              // response.credential is the ID token
              try {
                const r = await fetch(GOOGLE_AUTH_ENDPOINT, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id_token: response.credential })
                });
                const result = await r.json();
                if (result.success) {
                  // Use provided AuthContext methods to set auth state
                  localStorage.setItem('guru_edu_token', result.data.token);
                  localStorage.setItem('guru_edu_user', JSON.stringify(result.data.user));
                  // update context - set token, user and logged-in flag
                  try { if (typeof setToken === 'function') setToken(result.data.token); } catch (e) {}
                  try { if (typeof setUser === 'function') setUser(result.data.user); } catch (e) {}
                  try { if (typeof setIsLoggedIn === 'function') setIsLoggedIn(true); } catch (e) {}
                  router.push(redirectTo);
                } else {
                  console.error('Google auth failed:', result.message);
                }
              } catch (err) {
                console.error('Google auth network error:', err);
              }
            }
          });

          // Render the button
          if (containerRef.current) {
            window.google.accounts.id.renderButton(containerRef.current, {
              theme: 'outline',
              size: 'large',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load Google client id or script', err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
};

export default GoogleSignIn;
