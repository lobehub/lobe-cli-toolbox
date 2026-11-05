import { API_TYPE_SHORT } from '@lobehub/cli-common/llm';
import ProviderSetup, { saveProviderSetup } from '@lobehub/cli-common/ProviderSetup';
import { ConfigPanel, type ConfigPanelItem } from '@lobehub/cli-ui';
import { memo, useReducer } from 'react';

import { selectors, useConfStore } from '@/store';

const Config = memo(() => {
  const [, refresh] = useReducer((x: number) => x + 1, 0);
  const { set, store } = useConfStore();
  const provider = selectors.getProviderConfig();

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

  const items: ConfigPanelItem[] = [
    {
      desc: 'Pick a provider or a custom endpoint, then the API type, base URL, API key and model',
      key: 'provider',
      label: 'Provider',
      modified: !!store.provider,
      ownsEscape: true,
      render: providerItem('full'),
      value: `${provider.providerName} · ${API_TYPE_SHORT[provider.apiType]}`,
    },
    {
      desc: '`modelName` in the project config file takes precedence over this',
      key: 'modelName',
      label: 'Model',
      modified: !!store.modelName,
      ownsEscape: true,
      render: providerItem('model'),
      value: provider.model,
    },
  ];

  return <ConfigPanel items={items} logo="🤯" subtitle="settings" title="Lobe SEO" />;
});

export default Config;
