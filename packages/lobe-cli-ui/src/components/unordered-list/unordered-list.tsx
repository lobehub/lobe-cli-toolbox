import { Box } from 'ink';
import { type ReactNode, useContext, useMemo } from 'react';

import { useComponentTheme } from '../../theme';
import { defaultMarker } from './constants';
import { type Theme } from './theme';
import { UnorderedListContext } from './unordered-list-context';
import { UnorderedListItem } from './unordered-list-item';
import { UnorderedListItemContext } from './unordered-list-item-context';

export type UnorderedListProps = {
  /**
   * List items.
   */
  readonly children: ReactNode;
};

export function UnorderedList({ children }: UnorderedListProps) {
  const { depth } = useContext(UnorderedListContext);
  const { styles, config } = useComponentTheme<Theme>('UnorderedList');

  const listContext = useMemo(
    () => ({
      depth: depth + 1,
    }),
    [depth],
  );

  const listItemContext = useMemo(() => {
    const { marker } = config();

    if (typeof marker === 'string') {
      return { marker };
    }

    if (Array.isArray(marker)) {
      return {
        marker: marker[depth] ?? marker.at(-1) ?? defaultMarker,
      };
    }

    return {
      marker: defaultMarker,
    };
  }, [config, depth]);

  return (
    <UnorderedListContext.Provider value={listContext}>
      <UnorderedListItemContext.Provider value={listItemContext}>
        <Box {...styles.list()}>{children}</Box>
      </UnorderedListItemContext.Provider>
    </UnorderedListContext.Provider>
  );
}

UnorderedList.Item = UnorderedListItem;
