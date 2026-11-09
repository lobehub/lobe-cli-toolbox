import { SearchSelect } from '@lobehub/cli-ui';

export default function BasicDemo() {
  return (
    <SearchSelect
      items={[
        { label: 'claude-sonnet', value: 'claude-sonnet' },
        { label: 'claude-opus', value: 'claude-opus' },
        { label: 'gpt-4.1', value: 'gpt-4.1' },
      ]}
      onSelect={() => {}}
    />
  );
}
