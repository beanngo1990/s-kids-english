/* global jest */

const mockAsyncStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    clear: jest.fn(() => {
      mockAsyncStorage.clear();
      return Promise.resolve();
    }),
    getItem: jest.fn(key => Promise.resolve(mockAsyncStorage.get(key) ?? null)),
    removeItem: jest.fn(key => {
      mockAsyncStorage.delete(key);
      return Promise.resolve();
    }),
    setItem: jest.fn((key, value) => {
      mockAsyncStorage.set(key, value);
      return Promise.resolve();
    }),
  },
}));
