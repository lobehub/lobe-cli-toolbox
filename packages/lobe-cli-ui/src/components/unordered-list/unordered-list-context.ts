import { createContext } from 'react';

export type UnorderedListContextProps = {
  /**
   * Depth of the list.
   */
  depth: number;
};

export const UnorderedListContext = createContext<UnorderedListContextProps>({
  depth: 0,
});
