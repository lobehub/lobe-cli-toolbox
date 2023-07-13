import { TextInput } from '@inkjs/ui';
import { ConfigPanel, type ConfigPanelProps } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { useConfStore } from '@/store/confStore';

const Config = memo(() => {
  const [active, setActive] = useState<string>();
  const { store, set, getDefault } = useConfStore();

  const items: ConfigPanelProps['items'] = useMemo(
    () => [
      {
        children: (
          <TextInput
            defaultValue={store.openaiToken}
            onSubmit={(v) => set('openaiToken', v)}
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
            onSubmit={(v) => set('apiBaseUrl', v)}
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
