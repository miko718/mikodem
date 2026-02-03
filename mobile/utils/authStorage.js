import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'mikodem_auth_token';

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('SecureStore error:', e);
  }
}
