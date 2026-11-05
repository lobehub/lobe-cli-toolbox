import { Text } from 'ink';
import { Fragment, memo } from 'react';

import symbols from '../styles/symbols';

/** `[key, action]`, e.g. `['enter', 'confirm']`. */
export type KeyHint = readonly [key: string, action: string];

export interface KeyHintsProps {
  hints: (KeyHint | false | null | undefined)[];
}

const KeyHints = memo<KeyHintsProps>(({ hints }) => {
  const list = hints.filter(Boolean) as KeyHint[];
  return (
    <Text wrap="truncate-end">
      {list.map(([key, action], index) => (
        <Fragment key={key}>
          {index > 0 && <Text dimColor>{` ${symbols.separator} `}</Text>}
          <Text>{key}</Text>
          <Text dimColor>{` ${action}`}</Text>
        </Fragment>
      ))}
    </Text>
  );
});

export default KeyHints;
