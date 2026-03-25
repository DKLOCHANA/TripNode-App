import * as SecureStore from 'expo-secure-store';

/**
 * Typed wrapper around expo-secure-store for general key-value persistence.
 * Uses SecureStore as a drop-in replacement for AsyncStorage since
 * @react-native-async-storage/async-storage native module is unavailable in Expo managed workflow.
 *
 * Note: SecureStore has a 2048 byte limit per item, so large data is chunked.
 */

const CHUNK_SIZE = 2000; // Slightly below 2048 to account for overhead
const CHUNK_COUNT_SUFFIX = '_chunk_count';

async function getChunkedItem(key: string): Promise<string | null> {
  const chunkCountStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

  if (chunkCountStr !== null) {
    const chunkCount = parseInt(chunkCountStr, 10);
    const chunks: string[] = [];

    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
      if (chunk === null) return null;
      chunks.push(chunk);
    }

    return chunks.join('');
  }

  return SecureStore.getItemAsync(key);
}

async function setChunkedItem(key: string, value: string): Promise<void> {
  await deleteChunkedItem(key);

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  await SecureStore.setItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks.length));

  await Promise.all(
    chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}_chunk_${index}`, chunk))
  );
}

async function deleteChunkedItem(key: string): Promise<void> {
  const chunkCountStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

  if (chunkCountStr !== null) {
    const chunkCount = parseInt(chunkCountStr, 10);

    await Promise.all([
      SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`),
      ...Array.from({ length: chunkCount }, (_, i) =>
        SecureStore.deleteItemAsync(`${key}_chunk_${i}`)
      ),
    ]);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export const AsyncStorageService = {
  getItem: getChunkedItem,
  setItem: setChunkedItem,
  removeItem: deleteChunkedItem,
};
