import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Switch,
} from 'react-native';

import { useSupabase } from '~/app/context/useSupabase';
import { Button } from '~/components/Button';
import Divider from '~/components/Divider';
import Input from '~/components/Input';
import Title from '~/components/Title';

const extractParamsFromUrl = (url: string) => {
  const params = new URLSearchParams(url.split('#')[1]);
  const data = {
    access_token: params.get('access_token'),
    expires_in: parseInt(params.get('expires_in') || '0', 10),
    refresh_token: params.get('refresh_token'),
    token_type: params.get('token_type'),
    provider_token: params.get('provider_token'),
  };

  return data;
};

export default function Login() {
  const router = useRouter();
  const { login, getGoogleOAuthUrl, setOAuthSession, register } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isFreeformEnabled, setisFreeformEnabled] = useState(false);

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const onSignInWithGoogle = async () => {
    setLoading(true);
    try {
      const url = await getGoogleOAuthUrl();
      if (!url) return;

      const result = await WebBrowser.openAuthSessionAsync(url, 'kalendar://google-auth?', {
        showInRecents: true,
      });

      if (result.type === 'success') {
        const data = extractParamsFromUrl(result.url);

        if (!data.access_token || !data.refresh_token) return;

        setOAuthSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        // Store Google's access token if you need it later
        SecureStore.setItemAsync('google-access-token', JSON.stringify(data.provider_token));
      }
    } catch (error) {
      // Handle error here
      console.log(error);
    } finally {
      router.push('/Work');
      setLoading(false);
    }
  };

  const handleAuthAction = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (isFreeformEnabled) {
        router.push('/Integration');
      } else {
        router.push('/Work');
      }
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="mt-10 p-10">
        <View className="flex-1 flex-col p-4">
          <Title className="mb-4">{isLogin ? 'Login' : 'Create an account'}</Title>
          <Input
            placeholder="Email"
            className="mb-4"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Input
            placeholder="Password"
            secureTextEntry
            className="mb-4"
            value={password}
            onChangeText={setPassword}
          />
          <Button
            onPress={handleAuthAction}
            title={isLogin ? 'Login' : 'Sign Up'}
            disabled={loading}
          />
          <Divider text="or continue with" uppercase className="my-4" textClassName="text-sm" />
          <Button onPress={onSignInWithGoogle} title="Google" disabled={loading} className="mb-1" />
          <View className="mt-4 items-center">
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-sm text-gray-500">
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
