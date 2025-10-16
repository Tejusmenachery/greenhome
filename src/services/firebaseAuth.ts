import { FIREBASE_API_KEY, FIREBASE_AUTH_ENDPOINT } from '../config/firebaseConfig';

type SignInSuccess = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: boolean;
  displayName?: string;
};

export class FirebaseAuthError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

const errorMessages: Record<string, string> = {
  'EMAIL_NOT_FOUND': 'No user exists with the provided email address.',
  'INVALID_PASSWORD': 'The password is invalid. Please try again.',
  'USER_DISABLED': 'This user account has been disabled.',
  'INVALID_EMAIL': 'The email address is badly formatted.',
};

function buildEndpoint(apiKey: string) {
  const trimmedKey = apiKey?.trim();
  if (!trimmedKey || trimmedKey.startsWith('<')) {
    throw new FirebaseAuthError(
      'FIREBASE_API_KEY is not configured. Update src/config/firebaseConfig.ts with your project credentials.',
    );
  }

  const separator = FIREBASE_AUTH_ENDPOINT.includes('?') ? '&' : '?';
  return `${FIREBASE_AUTH_ENDPOINT}${separator}key=${trimmedKey}`;
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<SignInSuccess> {
  if (!email || !password) {
    throw new FirebaseAuthError('Email and password are required.');
  }

  const endpoint = buildEndpoint(FIREBASE_API_KEY);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorCode = payload?.error?.message;
    const message =
      (errorCode && errorMessages[errorCode]) ||
      'Unable to sign in with Firebase Authentication.';

    throw new FirebaseAuthError(message, errorCode);
  }

  return payload as SignInSuccess;
}
