import { TextInput } from '@inkjs/ui';
import { ConfigPanel, type ConfigPanelProps } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { type ConfigKeys, type Config as LocalConfig, useConfStore } from '@/store';

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
    ],
    [store],
  );

  return (
    <ConfigPanel
      active={active}
      items={items}
      logo="🤯"
      setActive={setActive}
      title="Lobe I18N Config"
    />
  );
});

export default Config;
