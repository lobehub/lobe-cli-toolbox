import { ConfigPanel, type ConfigPanelItem, TextField } from '@lobehub/cli-ui';
import { memo, useReducer } from 'react';

import { useConfStore } from '@/store/confStore';

const Config = memo(() => {
  const [, refresh] = useReducer((x: number) => x + 1, 0);
  const { set, store } = useConfStore();

  const items: ConfigPanelItem[] = [
    {
      desc: 'Needs write access to the target repo, falls back to GITHUB_TOKEN / GH_TOKEN',
      key: 'githubToken',
      label: 'GitHub token',
      modified: !!store.githubToken,
      render: (close) => (
        <TextField
          mask="•"
          placeholder="Paste a token, or leave empty to remove it"
          onSubmit={(value) => {
            set('githubToken', value.trim());
            refresh();
            close(true);
          }}
        />
      ),
      secret: true,
      value: store.githubToken,
    },
  ];

  return <ConfigPanel items={items} logo="🏷️" subtitle="settings" title="Lobe Label" />;
});

export default Config;
