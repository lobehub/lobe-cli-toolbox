import { TextInput } from '@lobehub/cli-ui';
import { ConfigPanel, type ConfigPanelProps } from '@lobehub/cli-ui';
import { memo, useMemo, useState } from 'react';

import { type ConfigKeys, type Config as LocalConfig, useConfStore } from '@/store/confStore';

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
            onSubmit={(v: string) => setConfig('githubToken', v)}
            placeholder="Input Github token..."
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
