import { useSyncExternalStore } from 'react';

export function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
) {
  const getSelection = () => selector(getSnapshot());
  const getServerSelection = getServerSnapshot ? () => selector(getServerSnapshot()) : undefined;
  return useSyncExternalStore(subscribe, getSelection, getServerSelection);
}

export { useSyncExternalStore };
