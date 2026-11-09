import { ConfigPanel, TextField } from '@lobehub/cli-ui';

export default function BasicDemo() {
  return (
    <ConfigPanel
      logo="🤯"
      title="Lobe Commit"
      items={[
        {
          key: 'model',
          label: 'Model',
          render: (close) => (
            <TextField
              defaultValue="gpt-4.1"
              onCancel={() => close()}
              onSubmit={() => close(true)}
            />
          ),
          value: 'gpt-4.1',
        },
        {
          key: 'apiKey',
          label: 'API Key',
          render: (close) => (
            <TextField
              defaultValue="sk-xxx"
              mask="•"
              onCancel={() => close()}
              onSubmit={() => close(true)}
            />
          ),
          secret: true,
          value: 'sk-xxx',
        },
        {
          key: 'locale',
          label: 'Locale',
          render: (close) => (
            <TextField defaultValue="en-US" onCancel={() => close()} onSubmit={() => close(true)} />
          ),
          value: 'en-US',
        },
      ]}
    />
  );
}
