import figures from 'figures';
import { createContext } from 'react';

export type OrderedListItemContextProps = {
  /**
   * Marker that's displayed before each list item.
   */
  marker: string;
};

export const OrderedListItemContext = createContext<OrderedListItemContextProps>({
  marker: figures.line,
});
