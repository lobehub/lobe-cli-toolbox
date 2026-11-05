import { createContext } from 'react';

import { defaultMarker } from './constants';

export type UnorderedListItemContextProps = {
  /**
   * Marker that's displayed before each list item.
   */
  marker: string;
};

export const UnorderedListItemContext = createContext<UnorderedListItemContextProps>({
  marker: defaultMarker,
});
