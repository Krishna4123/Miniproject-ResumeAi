// components/GoogleLogin.jsx

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const GoogleLogin = ({ onSuccess, onError, children }) => {
  const { googleLogin } = useAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        const result = await googleLogin(response.credential);
        if (result.success) {
          onSuccess && onSuccess(result);
        } else {
          onError && onError(result.error);
        }
      } catch (error) {
        onError && onError(error.message);
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup if needed
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  return (
    <div ref={googleButtonRef} className="w-full">
      {children}
    </div>
  );
};

export default GoogleLogin;
