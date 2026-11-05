import { TextInput } from '@lobehub/cli-ui';
import { ConfigPanel, type ConfigPanelProps, SelectInput } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { BASE_PROMPT } from '@/constants/template';
import { selectors, useConfStore } from '@/store';
import type { ConfigKeys, Config as LocalConfig } from '@/types/config';

import ProviderSetup, { saveProviderSetup } from '../../../../common/ProviderSetup';
import { API_TYPE_SHORT } from '../../../../common/llm';

const Config = memo(() => {
  const [active, setActive] = useState<string>();
  const { store, set, getDefault } = useConfStore();
  const provider = selectors.getProviderConfig();

  const setConfig = <K extends ConfigKeys>(key: K, value: LocalConfig[K]) => {
    set(key, value);
    setActive('');
  };

  const providerSetup = (mode: 'full' | 'model') => (
    <ProviderSetup
      current={provider}
      mode={mode}
      onCancel={() => setActive('')}
      onSubmit={(value) => {
        saveProviderSetup(value, provider, set);
        setActive('');
      }}
    />
  );

  const items: ConfigPanelProps['items'] = useMemo(
    () => [
      {
        children: providerSetup('full'),
        defaultValue: 'OpenAI',
        desc: 'Pick a provider or a custom endpoint, then the API type, base URL, API key and model',
        key: 'provider',
        label: 'Provider',
        value: `${provider.providerName} · ${API_TYPE_SHORT[provider.apiType]}`,
      },
      {
        children: providerSetup('model'),
        defaultValue: getDefault('modelName'),
        desc: `Models are fetched from ${provider.baseURL}, any model id can be typed`,
        key: 'modelName',
        label: 'Model',
        value: provider.model || '(not set)',
      },
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
            defaultValue={String(store.diffChunkTokens)}
            onSubmit={(v) =>
              setConfig('diffChunkTokens', Number(v) || getDefault('diffChunkTokens'))
            }
            placeholder="Input diff chunk size in tokens..."
          />
        ),
        defaultValue: getDefault('diffChunkTokens'),
        desc: `Diffs larger than this are summarized chunk by chunk, default as ${getDefault('diffChunkTokens')}. Lower it for small local models`,
        key: 'diffChunkTokens',
        label: 'Diff chunk tokens',
        value: store.diffChunkTokens,
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
          <SelectInput
            items={[
              {
                label: 'Enabled',
                value: 'true',
              },
              {
                label: 'Disabled',
                value: 'false',
              },
            ]}
            onSelect={(item) => setConfig('stream', item.value === 'true')}
          />
        ),
        defaultValue: getDefault('stream'),
        desc: 'Enable streaming output for AI responses, default as enabled',
        key: 'stream',
        label: 'Streaming output',
        showValue: false,
        value: store.stream,
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
