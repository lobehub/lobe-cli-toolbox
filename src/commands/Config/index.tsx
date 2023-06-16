import { TextInput } from '@inkjs/ui';
import SelectInput from 'ink-select-input';
import { memo, useState } from 'react';

import { TabsWithHeader, TabsWithHeaderItem } from '../../components';
import configStore, { CONFIG_NAME } from '../../constants/config';
import ConfigTitle from './ConfigTitle';

const Config = memo(() => {
  const [tab, setTab] = useState<string>('home');
  const emojiFormatConfig: boolean | any = configStore.get(CONFIG_NAME.EMOJI_FORMAT);
  const openaiTokenConfig: string | any = configStore.get(CONFIG_NAME.OPENAI_TOKEN);
  const apiBaseUrlConfig: string | any = configStore.get(CONFIG_NAME.API_BASE_URL);
  const githubTokenConfig: string | any = configStore.get(CONFIG_NAME.GITHUB_TOKEN);
  const promptConfig: string | any = configStore.get(CONFIG_NAME.PROMPT);
  const maxLengthConfig: number | any = configStore.get(CONFIG_NAME.MAX_LENGTH);
  const timeoutConfig: number | any = configStore.get(CONFIG_NAME.TIMEOUT);
  const localeConfig: number | any = configStore.get(CONFIG_NAME.LOCALE);
  const diffLength: number | any = configStore.get(CONFIG_NAME.DIFF_LENGTH);

  const updateConfig = (key: string, value: string | number | boolean) => {
    configStore.set(key, value);
    setTab('home');
  };

  const selection: any = [
    {
      label: (
        <ConfigTitle
          badge={emojiFormatConfig ? 'emoji' : 'code'}
          color="blue"
          title="Emoji format"
        />
      ),
      value: CONFIG_NAME.EMOJI_FORMAT,
    },
    {
      label: (
        <ConfigTitle
          badge={localeConfig || 'EN'}
          color={localeConfig ? 'green' : 'blue'}
          title="AI message locale"
        />
      ),
      value: CONFIG_NAME.LOCALE,
    },
    {
      label: (
        <ConfigTitle
          badge={promptConfig ? 'modify' : 'default'}
          color={promptConfig ? 'green' : 'blue'}
          title="Custom prompt"
        />
      ),
      value: CONFIG_NAME.PROMPT,
    },
    {
      label: <ConfigTitle badge={diffLength} color={'#fff'} title="Diff max-Length" />,
      value: CONFIG_NAME.DIFF_LENGTH,
    },
    {
      label: (
        <ConfigTitle badge={maxLengthConfig} color={'#fff'} title="Commit message max-Length" />
      ),
      value: CONFIG_NAME.MAX_LENGTH,
    },
    {
      label: (
        <ConfigTitle
          badge={openaiTokenConfig ? 'set' : 'unset'}
          color={openaiTokenConfig ? 'green' : 'red'}
          title="OpenAI token"
        />
      ),
      value: CONFIG_NAME.OPENAI_TOKEN,
    },
    {
      label: (
        <ConfigTitle
          badge={apiBaseUrlConfig ? 'modify' : 'default'}
          color={apiBaseUrlConfig ? 'green' : 'blue'}
          title="OpenAI API proxy"
        />
      ),
      value: CONFIG_NAME.API_BASE_URL,
    },
    {
      label: <ConfigTitle badge={timeoutConfig + 'ms'} color={'#fff'} title="OpenAI timeout" />,
      value: CONFIG_NAME.TIMEOUT,
    },
    {
      label: (
        <ConfigTitle
          badge={githubTokenConfig ? 'set' : 'unset'}
          color={githubTokenConfig ? 'green' : 'red'}
          title="Github token"
        />
      ),
      value: CONFIG_NAME.GITHUB_TOKEN,
    },
  ];

  const items: TabsWithHeaderItem[] = [
    {
      children: <SelectInput items={selection} onSelect={(item: any) => setTab(item.value)} />,
      key: 'home',
      title: '🤯 Lobe Commit Config',
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
          onSelect={(item: { label: string; value: string }) => {
            updateConfig(CONFIG_NAME.EMOJI_FORMAT, item.value === 'emoji');
          }}
        />
      ),
      key: CONFIG_NAME.EMOJI_FORMAT,
      title: '🤯 Emoji Format Config',
    },
    {
      children: (
        <TextInput
          defaultValue={localeConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.LOCALE, v);
          }}
          placeholder="Input commit messge locale..."
        />
      ),
      key: CONFIG_NAME.LOCALE,
      title: '🤯 Commit Message Locale Config',
    },
    {
      children: (
        <TextInput
          defaultValue={promptConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.PROMPT, v);
          }}
          placeholder="Input ChatGPT prompt..."
        />
      ),
      key: CONFIG_NAME.PROMPT,
      title: '🤯 Prompt Config',
    },
    {
      children: (
        <TextInput
          defaultValue={String(diffLength)}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.DIFF_LENGTH, Number(v));
          }}
          placeholder="The maximum character length of diff log, default 5000..."
        />
      ),
      key: CONFIG_NAME.DIFF_LENGTH,
      title: '🤯 Diff Max-Length Config',
    },
    {
      children: (
        <TextInput
          defaultValue={String(maxLengthConfig)}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.MAX_LENGTH, Number(v));
          }}
          placeholder="The maximum character length of the generated commit message, default 100..."
        />
      ),
      key: CONFIG_NAME.MAX_LENGTH,
      title: '🤯 Commit Message Max-Length Config',
    },
    {
      children: (
        <TextInput
          defaultValue={openaiTokenConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.OPENAI_TOKEN, v);
          }}
          placeholder="Input OpenAI token..."
        />
      ),
      key: CONFIG_NAME.OPENAI_TOKEN,
      title: '🤯 OpenAI Token Config',
    },
    {
      children: (
        <TextInput
          defaultValue={apiBaseUrlConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.API_BASE_URL, v);
          }}
          placeholder="Set openAI api proxy, default value: https://api.openai.com/v1/..."
        />
      ),
      key: CONFIG_NAME.API_BASE_URL,
      title: '🤯 OpenAI API Proxy Config',
    },
    {
      children: (
        <TextInput
          defaultValue={String(timeoutConfig)}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.TIMEOUT, Number(v));
          }}
          placeholder="The timeout for network requests to the OpenAI API in milliseconds, default 10000..."
        />
      ),
      key: CONFIG_NAME.TIMEOUT,
      title: '🤯 OpenAI Timeout Config',
    },
    {
      children: (
        <TextInput
          defaultValue={githubTokenConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.GITHUB_TOKEN, v);
          }}
          placeholder="Input Github token..."
        />
      ),
      key: CONFIG_NAME.GITHUB_TOKEN,
      title: '🤯 Github Token Config',
    },
  ];
  return <TabsWithHeader activeKey={tab} items={items} />;
});

export default Config;
