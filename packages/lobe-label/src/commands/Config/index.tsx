import { ConfigPanel, type ConfigPanelProps, TextInput } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { type Config as LocalConfig, type ConfigKeys, useConfStore } from '@/store/confStore';

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
            defaultValue={store.githubToken}
            placeholder="Input Github token..."
            onSubmit={(v: string) => setConfig('githubToken', v)}
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
      title="Lobe Label Config"
    />
  );
});

export default Config;
