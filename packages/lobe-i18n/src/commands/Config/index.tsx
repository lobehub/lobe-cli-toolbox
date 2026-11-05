import { ConfigPanel, type ConfigPanelProps } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { selectors, useConfStore } from '@/store';

import ProviderSetup, { saveProviderSetup } from '../../../../common/ProviderSetup';
import { API_TYPE_SHORT } from '../../../../common/llm';

const Config = memo(() => {
  const [active, setActive] = useState<string>();
  const { store, set } = useConfStore();
  const provider = selectors.getProviderConfig();

  const items: ConfigPanelProps['items'] = useMemo(() => {
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

    return [
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
        defaultValue: '',
        desc: '`modelName` in the project config file takes precedence over this',
        key: 'modelName',
        label: 'Model',
        value: provider.model || '(not set)',
      },
    ];
  }, [store]);

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
