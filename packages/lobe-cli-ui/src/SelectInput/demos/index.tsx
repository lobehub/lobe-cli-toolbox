import { SelectInput } from '@lobehub/cli-ui';

export default function BasicDemo() {
  return (
    <SelectInput
      items={[
        { hint: 'A new feature', label: '✨ feat', value: 'feat' },
        { hint: 'A bug fix', label: '🐛 fix', value: 'fix' },
        { hint: 'A code change', label: '♻️ refactor', value: 'refactor' },
        { hint: 'Documentation only', label: '📝 docs', value: 'docs' },
      ]}
    />
  );
}
