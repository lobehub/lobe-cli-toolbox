import { Panel, SearchSelect, searchSelectHints, type SearchSelectItem } from '@lobehub/cli-ui';
import { memo } from 'react';

import gitmojis from '@/constants/gitmojis';
import { selectors } from '@/store';
import { useCommitStore } from '@/store/commitStore';

export const AI_VALUE = 'ai';

const items: SearchSelectItem[] = [
  {
    hint: 'Let AI write the message from the staged diff',
    keywords: ['generate', 'gpt', 'llm'],
    label: '🤯 ai',
    value: AI_VALUE,
  },
  ...gitmojis.map((item) => ({
    hint: item.desc,
    keywords: [item.name, item.code],
    label: `${item.emoji} ${item.type}`,
    value: item.type,
  })),
];

interface TypeStepProps {
  onCancel: () => void;
}

const TypeStep = memo<TypeStepProps>(({ onCancel }) => {
  const type = useCommitStore((st) => st.type);

  const handleSelect = (value: string) => {
    const { setEmoji, setStep, setType } = useCommitStore.getState();
    if (value === AI_VALUE) return setStep('ai');

    const gitmoji = gitmojis.find((item) => item.type === value)!;
    setType(gitmoji.type);
    setEmoji(selectors.getConfig('emoji') === 'code' ? gitmoji.code : gitmoji.emoji);
    setStep('scope');
  };

  return (
    <Panel hints={[...searchSelectHints.slice(0, -1), ['esc', 'cancel']]} title="Commit type">
      <SearchSelect
        initialValue={type || undefined}
        items={items}
        labelWidth={14}
        placeholder="Search type, e.g. fix"
        onCancel={onCancel}
        onSelect={handleSelect}
      />
    </Panel>
  );
});

export default TypeStep;
