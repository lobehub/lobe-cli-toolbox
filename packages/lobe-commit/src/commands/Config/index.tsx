import { TextInput } from '@inkjs/ui';
import { ConfigPanel, type ConfigPanelProps, SelectInput } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { BASE_PROMPT } from '@/constants/template';
import { type ConfigKeys, type Config as LocalConfig, useConfStore } from '@/store/confStore';

const Config = memo(() => {
  const [active, setActive] = useState<string>();
  const { store, set, getDefault } = useConfStore();

  const setConfig = <K extends ConfigKeys>(key: K, value: LocalConfig[K]) => {
    set(key, value);
    setActive('');
  };

  const items: ConfigPanelProps['items'] = useMemo(
    () => [
      {
        children: (
          <SelectInput
            items={[
              {
                label: '😄',
                value: 'emoji',
              },
              {
                label: ':smile:',
                value: 'code',
              },
            ]}
            onSelect={(item) => setConfig('emoji', item.value as 'emoji' | 'code')}
          />
        ),
        defaultValue: getDefault('emoji'),
        key: 'emoji',
        label: 'Emoji format',
        value: store.emoji,
      },
      {
        children: (
          <TextInput
            defaultValue={store.locale}
            onSubmit={(v) => setConfig('locale', v)}
            placeholder="Input commit message locale..."
          />
        ),
        defaultValue: getDefault('locale') || 'en_US',
        desc: 'Commit message locale, default as en_US',
        key: 'local',
        label: 'AI message locale',
        value: store.locale || 'en_US',
      },
      {
        children: (
          <TextInput
            defaultValue={store.prompt}
            onSubmit={(v) => setConfig('prompt', v)}
            placeholder="Input ChatGPT prompt..."
          />
        ),
        defaultValue: getDefault('prompt') || BASE_PROMPT,
        desc: BASE_PROMPT,
        key: 'prompt',
        label: 'Custom prompt',
        showValue: false,
        value: store.prompt || BASE_PROMPT,
      },
      {
        children: (
          <TextInput
            defaultValue={String(store.diffChunkSize)}
            onSubmit={(v) => setConfig('diffChunkSize', Number(v))}
            placeholder={`Input diff split chunk size ...`}
          />
        ),
        defaultValue: getDefault('diffChunkSize'),
        desc: `Default chunk size as ${getDefault('diffChunkSize')}`,
        key: 'diffChunkSize',
        label: 'Diff split chunk size',
        value: store.diffChunkSize,
      },
      {
        children: (
          <TextInput
            defaultValue={String(store.maxLength)}
            onSubmit={(v) => setConfig('maxLength', Number(v))}
            placeholder={`Input maximum character length of the generated commit message...`}
          />
        ),
        defaultValue: getDefault('maxLength'),
        desc: `The maximum character length of the generated commit message, default max-length as ${getDefault(
          'maxLength',
        )}`,
        key: 'maxLength',
        label: 'Commit message max-length',
        value: store.maxLength,
      },
      {
        children: (
          <TextInput
            defaultValue={store.openaiToken}
            onSubmit={(v) => setConfig('openaiToken', v)}
            placeholder="Input OpenAI token..."
          />
        ),
        defaultValue: getDefault('openaiToken'),
        key: 'openaiToken',
        label: 'OpenAI token',
        showValue: false,
        value: store.openaiToken,
      },
      {
        children: (
          <TextInput
            defaultValue={store.apiBaseUrl}
            onSubmit={(v) => setConfig('apiBaseUrl', v)}
            placeholder="Set openAI API proxy, default value: https://api.openai.com/v1/..."
          />
        ),
        defaultValue: getDefault('apiBaseUrl'),
        desc: 'OpenAI API proxy, default value: https://api.openai.com/v1/',
        key: 'apiBaseUrl',
        label: 'OpenAI API proxy',
        showValue: false,
        value: store.apiBaseUrl,
      },
      {
        children: (
          <TextInput
            defaultValue={store.githubToken}
            onSubmit={(v) => setConfig('githubToken', v)}
            placeholder="Input Github token..."
          />
        ),
        defaultValue: getDefault('githubToken'),
        key: 'githubToken',
        label: 'Github token',
        showValue: false,
        value: store.githubToken,
      },
    ],
    [store],
  );

  return (
    <ConfigPanel
      active={active}
      items={items}
      logo="🤯"
      setActive={setActive}
      title="Lobe Commit Config"
    />
  );
});

export default Config;
