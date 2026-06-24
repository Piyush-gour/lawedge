/**
 * Google Sign-In using Google Identity Services (GIS)
 *
 * To make this work:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create an OAuth 2.0 Client ID (Web application)
 * 3. Add http://localhost:5173 to "Authorized JavaScript origins"
 * 4. Copy the Client ID and paste it below
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let googleScriptLoaded = false;
let googleScriptLoading = false;
let loadCallbacks = [];

/**
 * Load the Google Identity Services script
 */
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded) {
      resolve();
      return;
    }

    if (googleScriptLoading) {
      loadCallbacks.push({ resolve, reject });
      return;
    }

    googleScriptLoading = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleScriptLoaded = true;
      googleScriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb.resolve());
      loadCallbacks = [];
    };

    script.onerror = () => {
      googleScriptLoading = false;
      const err = new Error('Failed to load Google Sign-In');
      reject(err);
      loadCallbacks.forEach((cb) => cb.reject(err));
      loadCallbacks = [];
    };

    document.head.appendChild(script);
  });
}

/**
 * Trigger Google One-Tap / popup sign-in flow
 * Returns the credential (JWT ID token) from Google
 */
export async function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      'Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in client/.env'
    );
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    /* global google */
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('Google sign-in was cancelled'));
        }
      },
    });

    // Use popup prompt
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        // Fallback: use the button-based flow via a hidden button
        const btnDiv = document.createElement('div');
        btnDiv.style.display = 'none';
        document.body.appendChild(btnDiv);

        google.accounts.id.renderButton(btnDiv, {
          type: 'standard',
          size: 'large',
        });

        // Auto-click the rendered button
        const btn = btnDiv.querySelector('[role="button"]');
        if (btn) btn.click();

        // Clean up after a delay
        setTimeout(() => btnDiv.remove(), 60000);
      }
      if (notification.isDismissedMoment()) {
        reject(new Error('Google sign-in was dismissed'));
      }
    });
  });
}
