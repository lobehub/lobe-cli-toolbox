import { createContext } from 'react';

export type OrderedListContextProps = {
  /**
   * Marker from the parent list.
   */
  marker: string;
};

export const OrderedListContext = createContext<OrderedListContextProps>({
  marker: '',
});
