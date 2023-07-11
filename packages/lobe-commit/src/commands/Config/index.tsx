import { TextInput } from '@inkjs/ui';
import { ConfigPanel, type ConfigPanelProps, SelectInput } from '@lobehub/cli-ui';
import { memo, useCallback, useMemo, useState } from 'react';

import configStore, { CONFIG_NAME, schema } from '@/constants/config';
import { BASE_PROMPT } from '@/constants/template';

const Config = memo(() => {
  const [active, setActive] = useState<string>();
  const [count, setCount] = useState<number>(0);
  const localConfig = useMemo(
    () => ({
      apiBaseUrl: configStore.get(CONFIG_NAME.API_BASE_URL) as string,
      diffChunkSize: configStore.get(CONFIG_NAME.DIFF_CHUNK_SIZE) as number,
      emojiFormat: configStore.get(CONFIG_NAME.EMOJI_FORMAT) as 'emoji' | 'code',
      githubToken: configStore.get(CONFIG_NAME.GITHUB_TOKEN) as string,
      locale: configStore.get(CONFIG_NAME.LOCALE) as string,
      maxLength: configStore.get(CONFIG_NAME.MAX_LENGTH) as number,
      openaiToken: configStore.get(CONFIG_NAME.OPENAI_TOKEN) as string,
      prompt: configStore.get(CONFIG_NAME.PROMPT) as string,
    }),
    [count],
  );

  const updateConfig = useCallback(
    (key: string, value: string | number | boolean) => {
      configStore.set(key, value);
      setCount(count + 1);
      setActive('');
    },
    [count],
  );

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
            onSelect={(item) => updateConfig(CONFIG_NAME.EMOJI_FORMAT, item.value)}
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.EMOJI_FORMAT]?.default,
        key: CONFIG_NAME.EMOJI_FORMAT,
        label: 'Emoji format',
        value: localConfig.emojiFormat,
      },
      {
        children: (
          <TextInput
            defaultValue={localConfig.locale}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.LOCALE, v);
            }}
            placeholder="Input commit message locale..."
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.LOCALE]?.default || 'en_US',
        desc: 'Commit message locale, default as en_US',
        key: CONFIG_NAME.LOCALE,
        label: 'AI message locale',
        value: localConfig.locale || 'en_US',
      },
      {
        children: (
          <TextInput
            defaultValue={localConfig.prompt}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.PROMPT, v);
            }}
            placeholder="Input ChatGPT prompt..."
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.PROMPT]?.default || BASE_PROMPT,
        desc: BASE_PROMPT,
        key: CONFIG_NAME.PROMPT,
        label: 'Custom prompt',
        showValue: false,
        value: localConfig.prompt || BASE_PROMPT,
      },
      {
        children: (
          <TextInput
            defaultValue={String(localConfig.diffChunkSize)}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.DIFF_CHUNK_SIZE, Number(v));
            }}
            placeholder={`Input diff split chunk size ...`}
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.DIFF_CHUNK_SIZE]?.default,
        desc: `Default chunk size as ${schema?.[CONFIG_NAME.DIFF_CHUNK_SIZE]?.default}`,
        key: CONFIG_NAME.DIFF_CHUNK_SIZE,
        label: 'Diff split chunk size',
        value: localConfig.diffChunkSize,
      },
      {
        children: (
          <TextInput
            defaultValue={String(localConfig.maxLength)}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.MAX_LENGTH, Number(v));
            }}
            placeholder={`Input maximum character length of the generated commit message...`}
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.MAX_LENGTH]?.default,
        desc: `The maximum character length of the generated commit message, default max-length as ${schema?.[
          CONFIG_NAME.MAX_LENGTH
        ]?.default}`,
        key: CONFIG_NAME.MAX_LENGTH,
        label: 'Commit message max-length',
        value: localConfig.maxLength,
      },
      {
        children: (
          <TextInput
            defaultValue={localConfig.openaiToken}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.OPENAI_TOKEN, v);
            }}
            placeholder="Input OpenAI token..."
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.OPENAI_TOKEN]?.default,
        key: CONFIG_NAME.OPENAI_TOKEN,
        label: 'OpenAI token',
        showValue: false,
        value: localConfig.openaiToken,
      },
      {
        children: (
          <TextInput
            defaultValue={localConfig.apiBaseUrl}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.API_BASE_URL, v);
            }}
            placeholder="Set openAI API proxy, default value: https://api.openai.com/v1/..."
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.API_BASE_URL]?.default,
        desc: 'OpenAI API proxy, default value: https://api.openai.com/v1/',
        key: CONFIG_NAME.API_BASE_URL,
        label: 'OpenAI API proxy',
        showValue: false,
        value: localConfig.apiBaseUrl,
      },
      {
        children: (
          <TextInput
            defaultValue={localConfig.githubToken}
            onSubmit={(v) => {
              updateConfig(CONFIG_NAME.GITHUB_TOKEN, v);
            }}
            placeholder="Input Github token..."
          />
        ),
        defaultValue: schema?.[CONFIG_NAME.GITHUB_TOKEN]?.default,
        key: CONFIG_NAME.GITHUB_TOKEN,
        label: 'Github token',
        showValue: false,
        value: localConfig.githubToken,
      },
    ],
    [localConfig],
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
