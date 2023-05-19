import { TextInput } from '@inkjs/ui';
import SelectInput from 'ink-select-input';
import React, { useState } from 'react';
import { TabsWithHeader, TabsWithHeaderItem } from '../../components';
import configStore, { CONFIG_NAME } from '../../constants/config';
import ConfigTitle from './ConfigTitle';

const Config: React.FC = () => {
  const [tab, setTab] = useState<string>('home');
  const emojiFormatConfig = configStore.get(CONFIG_NAME.EMOJI_FORMAT);
  const openaiTokenConfig = configStore.get(CONFIG_NAME.OPENAI_TOKEN);
  const apiBaseUrlConfig = configStore.get(CONFIG_NAME.API_BASE_URL);
  const githubTokenConfig = configStore.get(CONFIG_NAME.GITHUB_TOKEN);
  const promptConfig = configStore.get(CONFIG_NAME.PROMPT);

  const updateConfig = (key, value) => {
    configStore.set(key, value);
    setTab('home');
  };

  const selection: any = [
    {
      label: (
        <ConfigTitle
          title="Emoji Format"
          color="blue"
          badge={emojiFormatConfig ? 'emoji' : 'code'}
        />
      ),
      value: CONFIG_NAME.EMOJI_FORMAT,
    },
    {
      label: (
        <ConfigTitle
          title="Custom Prompt"
          color={promptConfig ? 'green' : 'blue'}
          badge={promptConfig ? 'modify' : 'default'}
        />
      ),
      value: CONFIG_NAME.PROMPT,
    },
    {
      label: (
        <ConfigTitle
          title="OpenAI Token"
          color={openaiTokenConfig ? 'green' : 'red'}
          badge={openaiTokenConfig ? 'set' : 'unset'}
        />
      ),
      value: CONFIG_NAME.OPENAI_TOKEN,
    },
    {
      label: (
        <ConfigTitle
          title="OpenAI API Proxy"
          color={apiBaseUrlConfig ? 'green' : 'blue'}
          badge={apiBaseUrlConfig ? 'modify' : 'default'}
        />
      ),
      value: CONFIG_NAME.API_BASE_URL,
    },
    {
      label: (
        <ConfigTitle
          title="Github Token"
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
      title: '🤯 Emoji Format Setting',
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
          onSelect={(item: any) => {
            updateConfig(CONFIG_NAME.EMOJI_FORMAT, item.value === 'emoji');
          }}
        />
      ),
    },
    {
      title: '🤯 Prompt Setting',
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
      title: '🤯 OpenAI Token Setting',
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
      title: '🤯 OpenAI API Proxy',
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
      title: '🤯 Github Token Setting',
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
