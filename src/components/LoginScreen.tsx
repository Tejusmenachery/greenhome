import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FirebaseAuthError, signInWithEmailPassword } from '../services/firebaseAuth';
import { FIREBASE_API_KEY } from '../config/firebaseConfig';

type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; email: string }
  | { status: 'error'; message: string };

const initialState: AuthState = { status: 'idle' };

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authState, setAuthState] = useState<AuthState>(initialState);

  const isLoading = authState.status === 'loading';

  const isConfigured = useMemo(() => {
    const trimmed = FIREBASE_API_KEY?.trim();
    return Boolean(trimmed && !trimmed.startsWith('<'));
  }, []);

  const helperText = useMemo(() => {
    if (!isConfigured) {
      return 'Add your Firebase Web API key in src/config/firebaseConfig.ts to enable sign-in.';
    }

    switch (authState.status) {
      case 'success':
        return `Signed in as ${authState.email}`;
      case 'error':
        return authState.message;
      default:
        return 'Sign in with your Firebase email and password.';
    }
  }, [authState]);

  const helperTextStyle = useMemo(() => {
    switch (authState.status) {
      case 'success':
        return styles.helperSuccess;
      case 'error':
        return styles.helperError;
      default:
        return isConfigured ? styles.helperNeutral : styles.helperWarning;
    }
  }, [authState.status, isConfigured]);

  async function handleSubmit() {
    if (!isConfigured) {
      setAuthState({
        status: 'error',
        message: 'Firebase is not configured. Update src/config/firebaseConfig.ts before signing in.',
      });
      return;
    }

    setAuthState({ status: 'loading' });

    try {
      const result = await signInWithEmailPassword(email.trim(), password);
      setAuthState({ status: 'success', email: result.email });
    } catch (error) {
      if (error instanceof FirebaseAuthError) {
        setAuthState({ status: 'error', message: error.message });
        return;
      }

      setAuthState({
        status: 'error',
        message: 'Unexpected error. Please try again later.',
      });
    }
  }

  const isSubmitDisabled =
    !isConfigured || isLoading || email.trim().length === 0 || password.trim().length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Greenhome</Text>
          <Text style={[styles.helperText, helperTextStyle]}>{helperText}</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              accessibilityLabel="Email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#8A8A8A"
              secureTextEntry
              style={styles.input}
              textContentType="password"
              value={password}
            />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSubmitDisabled}
            onPress={handleSubmit}
            style={[styles.button, isSubmitDisabled && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b3d20',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    color: '#0b3d20',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  helperNeutral: {
    color: '#3c3c3c',
  },
  helperError: {
    color: '#c53030',
  },
  helperSuccess: {
    color: '#2f855a',
  },
  helperWarning: {
    color: '#b7791f',
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#1f2933',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderColor: '#d1d5db',
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b3d20',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
