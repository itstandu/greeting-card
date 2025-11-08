type AccessTokenListener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<AccessTokenListener>();

const notify = () => {
  listeners.forEach(listener => listener(accessToken));
};

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  notify();
};

export const clearAccessToken = (): void => {
  setAccessToken(null);
};

export const getAccessToken = (): string | null => accessToken;

export const subscribeAccessToken = (listener: AccessTokenListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
