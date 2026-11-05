import { API_TYPE_SHORT } from '@lobehub/cli-common/llm';
import ProviderSetup, { saveProviderSetup } from '@lobehub/cli-common/ProviderSetup';
import { ConfigPanel, type ConfigPanelItem, SelectInput, TextField } from '@lobehub/cli-ui';
import { memo, useReducer } from 'react';

import { DEFAULT_PROMPT } from '@/prompts/commits';
import { selectors, useConfStore } from '@/store';
import type { Config as LocalConfig, ConfigKeys } from '@/types/config';

const positiveInteger = (value: string) =>
  /^\d+$/.test(value.trim()) && Number(value) > 0 ? undefined : 'Enter a positive whole number';

const Config = memo(() => {
  const [, refresh] = useReducer((x: number) => x + 1, 0);
  const { store, set, getDefault } = useConfStore();
  const provider = selectors.getProviderConfig();

  const save = <K extends ConfigKeys>(key: K, value: LocalConfig[K]) => {
    set(key, value);
    refresh();
  };

  const providerItem = (mode: 'full' | 'model') => (close: (saved?: boolean) => void) => (
    <ProviderSetup
      current={provider}
      mode={mode}
      onCancel={() => close()}
      onSubmit={(value) => {
        saveProviderSetup(value, provider, set);
        refresh();
        close(true);
      }}
    />
  );

  const toggle =
    (key: 'includeWhy' | 'stream', on: string, off: string) =>
    (close: (saved?: boolean) => void) => (
      <SelectInput
        initialValue={String(store[key])}
        labelWidth={8}
        items={[
          { hint: on, label: 'On', value: 'true' },
          { hint: off, label: 'Off', value: 'false' },
        ]}
        onSelect={(item) => {
          save(key, item.value === 'true');
          close(true);
        }}
      />
    );

  const items: ConfigPanelItem[] = [
    {
      desc: 'Pick a provider or a custom endpoint, then the API type, base URL, API key and model',
      key: 'provider',
      label: 'Provider',
      modified: !!selectors.getConfig('provider'),
      ownsEscape: true,
      render: providerItem('full'),
      value: `${provider.providerName} · ${API_TYPE_SHORT[provider.apiType]}`,
    },
    {
      desc: `Models are fetched from ${provider.baseURL}, any model id can be typed`,
      key: 'modelName',
      label: 'Model',
      modified: !!selectors.getConfig('modelName'),
      ownsEscape: true,
      render: providerItem('model'),
      value: provider.model,
    },
    {
      desc: 'How the gitmoji is written in the commit message',
      key: 'emoji',
      label: 'Emoji format',
      modified: store.emoji !== getDefault('emoji'),
      render: (close) => (
        <SelectInput
          initialValue={store.emoji}
          labelWidth={12}
          items={[
            { hint: '✨ feat: add login', label: 'Emoji', value: 'emoji' },
            { hint: ':sparkles: feat: add login', label: 'Shortcode', value: 'code' },
          ]}
          onSelect={(item) => {
            save('emoji', item.value as LocalConfig['emoji']);
            close(true);
          }}
        />
      ),
      value: store.emoji === 'code' ? 'shortcode' : 'emoji',
    },
    {
      desc: 'Language of AI generated messages, e.g. en_US, zh_CN, ja_JP',
      key: 'locale',
      label: 'Language',
      modified: !!store.locale,
      render: (close) => (
        <TextField
          defaultValue={store.locale}
          placeholder="en_US"
          onSubmit={(value) => {
            save('locale', value.trim());
            close(true);
          }}
        />
      ),
      value: store.locale || 'en_US',
    },
    {
      desc: 'Replaces the system prompt for AI messages, leave empty to use the default',
      key: 'prompt',
      label: 'Custom prompt',
      modified: !!store.prompt,
      render: (close) => (
        <TextField
          defaultValue={store.prompt}
          description={`Default: ${DEFAULT_PROMPT}`}
          placeholder="Use the default prompt"
          onSubmit={(value) => {
            save('prompt', value.trim());
            close(true);
          }}
        />
      ),
      value: store.prompt ? 'custom' : 'default',
    },
    {
      desc: 'Add a short explanation of why the change was made to AI messages',
      key: 'includeWhy',
      label: 'Explain why',
      modified: store.includeWhy !== getDefault('includeWhy'),
      render: toggle('includeWhy', 'add a "why" to the message', 'only describe the change'),
      value: store.includeWhy,
    },
    {
      desc: 'Show AI messages as they are generated',
      key: 'stream',
      label: 'Streaming',
      modified: store.stream !== getDefault('stream'),
      render: toggle('stream', 'show text as it arrives', 'wait for the full message'),
      value: store.stream,
    },
    {
      desc: `Upper bound for AI messages, default ${getDefault('maxLength')} characters`,
      key: 'maxLength',
      label: 'Max length',
      modified: store.maxLength !== getDefault('maxLength'),
      render: (close) => (
        <TextField
          defaultValue={String(store.maxLength)}
          validate={positiveInteger}
          onSubmit={(value) => {
            save('maxLength', Number(value));
            close(true);
          }}
        />
      ),
      value: store.maxLength,
    },
    {
      desc: `Larger diffs are summarized chunk by chunk, default ${getDefault('diffChunkTokens')}. Lower it for small local models`,
      key: 'diffChunkTokens',
      label: 'Diff chunk tokens',
      modified: store.diffChunkTokens !== getDefault('diffChunkTokens'),
      render: (close) => (
        <TextField
          defaultValue={String(store.diffChunkTokens)}
          validate={positiveInteger}
          onSubmit={(value) => {
            save('diffChunkTokens', Number(value));
            close(true);
          }}
        />
      ),
      value: store.diffChunkTokens,
    },
    {
      desc: 'Used to list open issues when linking them, GITHUB_TOKEN / GH_TOKEN take precedence',
      key: 'githubToken',
      label: 'GitHub token',
      modified: !!selectors.getConfig('githubToken'),
      render: (close) => (
        <TextField
          mask="•"
          placeholder="Paste a token, or leave empty to remove it"
          onSubmit={(value) => {
            save('githubToken', value.trim());
            close(true);
          }}
        />
      ),
      secret: true,
      value: store.githubToken,
    },
  ];

  return <ConfigPanel items={items} logo="🤯" subtitle="settings" title="Lobe Commit" />;
});

export default Config;
