import { TextInput } from '@inkjs/ui';
import SelectInput from 'ink-select-input';
import React, { useState } from 'react';
import { TabsWithHeader, TabsWithHeaderItem } from '../../components';
import configStore, { CONFIG_NAME } from '../../constants/config';
import ConfigTitle from './ConfigTitle';

const Config: React.FC = () => {
  const [tab, setTab] = useState<string>('home');
  const emojiFormatConfig: boolean | any = configStore.get(CONFIG_NAME.EMOJI_FORMAT);
  const openaiTokenConfig: string | any = configStore.get(CONFIG_NAME.OPENAI_TOKEN);
  const apiBaseUrlConfig: string | any = configStore.get(CONFIG_NAME.API_BASE_URL);
  const githubTokenConfig: string | any = configStore.get(CONFIG_NAME.GITHUB_TOKEN);
  const promptConfig: string | any = configStore.get(CONFIG_NAME.PROMPT);
  const maxLengthConfig: number | any = configStore.get(CONFIG_NAME.MAX_LENGTH);
  const timeoutConfig: number | any = configStore.get(CONFIG_NAME.TIMEOUT);
  const localeConfig: number | any = configStore.get(CONFIG_NAME.LOCALE);

  const updateConfig = (key: string, value: string | number | boolean) => {
    configStore.set(key, value);
    setTab('home');
  };

  const selection: any = [
    {
      label: (
        <ConfigTitle
          title="Emoji format"
          color="blue"
          badge={emojiFormatConfig ? 'emoji' : 'code'}
        />
      ),
      value: CONFIG_NAME.EMOJI_FORMAT,
    },
    {
      label: (
        <ConfigTitle
          title="AI message locale"
          color={localeConfig ? 'green' : 'blue'}
          badge={localeConfig || 'EN'}
        />
      ),
      value: CONFIG_NAME.LOCALE,
    },
    {
      label: (
        <ConfigTitle
          title="Custom prompt"
          color={promptConfig ? 'green' : 'blue'}
          badge={promptConfig ? 'modify' : 'default'}
        />
      ),
      value: CONFIG_NAME.PROMPT,
    },
    {
      label: (
        <ConfigTitle title="Commit message max-Length" color={'#fff'} badge={maxLengthConfig} />
      ),
      value: CONFIG_NAME.MAX_LENGTH,
    },
    {
      label: (
        <ConfigTitle
          title="OpenAI token"
          color={openaiTokenConfig ? 'green' : 'red'}
          badge={openaiTokenConfig ? 'set' : 'unset'}
        />
      ),
      value: CONFIG_NAME.OPENAI_TOKEN,
    },
    {
      label: (
        <ConfigTitle
          title="OpenAI API proxy"
          color={apiBaseUrlConfig ? 'green' : 'blue'}
          badge={apiBaseUrlConfig ? 'modify' : 'default'}
        />
      ),
      value: CONFIG_NAME.API_BASE_URL,
    },
    {
      label: <ConfigTitle title="OpenAI timeout" color={'#fff'} badge={timeoutConfig + 'ms'} />,
      value: CONFIG_NAME.TIMEOUT,
    },
    {
      label: (
        <ConfigTitle
          title="Github token"
          color={githubTokenConfig ? 'green' : 'red'}
          badge={githubTokenConfig ? 'set' : 'unset'}
        />
      ),
      value: CONFIG_NAME.GITHUB_TOKEN,
    },
  ];

  const items: TabsWithHeaderItem[] = [
    {
      title: '🤯 Lobe Commit Config',
      key: 'home',
      children: <SelectInput items={selection} onSelect={(item: any) => setTab(item.value)} />,
    },
    {
      title: '🤯 Emoji Format Config',
      key: CONFIG_NAME.EMOJI_FORMAT,
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
    },
    {
      title: '🤯 Commit Message Locale Config',
      key: CONFIG_NAME.LOCALE,
      children: (
        <TextInput
          placeholder="Input commit messge locale..."
          defaultValue={localeConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.LOCALE, v);
          }}
        />
      ),
    },
    {
      title: '🤯 Prompt Config',
      key: CONFIG_NAME.PROMPT,
      children: (
        <TextInput
          placeholder="Input ChatGPT prompt..."
          defaultValue={promptConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.PROMPT, v);
          }}
        />
      ),
    },
    {
      title: '🤯 Commit Message Max-Length Config',
      key: CONFIG_NAME.MAX_LENGTH,
      children: (
        <TextInput
          placeholder="The maximum character length of the generated commit message, default 100..."
          defaultValue={String(maxLengthConfig)}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.MAX_LENGTH, Number(v));
          }}
        />
      ),
    },
    {
      title: '🤯 OpenAI Token Config',
      key: CONFIG_NAME.OPENAI_TOKEN,
      children: (
        <TextInput
          placeholder="Input OpenAI token..."
          defaultValue={openaiTokenConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.OPENAI_TOKEN, v);
          }}
        />
      ),
    },
    {
      title: '🤯 OpenAI API Proxy Config',
      key: CONFIG_NAME.API_BASE_URL,
      children: (
        <TextInput
          placeholder="Set openAI api proxy, default value: https://api.openai.com/v1/..."
          defaultValue={apiBaseUrlConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.API_BASE_URL, v);
          }}
        />
      ),
    },
    {
      title: '🤯 OpenAI Timeout Config',
      key: CONFIG_NAME.TIMEOUT,
      children: (
        <TextInput
          placeholder="The timeout for network requests to the OpenAI API in milliseconds, default 10000..."
          defaultValue={String(timeoutConfig)}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.TIMEOUT, Number(v));
          }}
        />
      ),
    },
    {
      title: '🤯 Github Token Config',
      key: CONFIG_NAME.GITHUB_TOKEN,
      children: (
        <TextInput
          placeholder="Input Github token..."
          defaultValue={githubTokenConfig}
          onSubmit={(v) => {
            updateConfig(CONFIG_NAME.GITHUB_TOKEN, v);
          }}
        />
      ),
    },
  ];
  return <TabsWithHeader items={items} activeKey={tab} />;
};

export default Config;
