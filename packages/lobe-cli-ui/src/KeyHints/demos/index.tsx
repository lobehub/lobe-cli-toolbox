import { KeyHints } from '@lobehub/cli-ui';

export default function BasicDemo() {
  return (
    <KeyHints
      hints={[
        ['enter', 'confirm'],
        ['esc', 'back'],
        ['↑↓', 'move'],
      ]}
    />
  );
}
