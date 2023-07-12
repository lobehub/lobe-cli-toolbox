import { TextInput } from '@inkjs/ui';
import { Panel, SelectInput, SelectInputItem, SplitView } from '@lobehub/cli-ui';
import { Text, useInput } from 'ink';
import { debounce } from 'lodash-es';
import { memo, useCallback, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { ListItem } from '@/commands/List';
import { useCommitStore } from '@/store/commitStore';

import Header from './Header';

const INPUT_VALUE = 'Use Input Value';

const commitScopes: SelectInputItem[] = [
  {
    label: 'Input commit scope',
    value: INPUT_VALUE,
  },
  {
    label: 'Package management changes, such as adding, updating, or removing dependencies',
    value: 'deps',
  },
  {
    label:
      'Configuration file changes, such as adding, updating, or removing configuration options',
    value: 'config',
  },
  {
    label: 'User interface changes, such as layout, style, or interaction modifications',
    value: 'ui',
  },
  {
    label: 'API interface changes, such as adding, modifying, or removing API endpoints',
    value: 'api',
  },
  {
    label: 'Database changes, such as adding, modifying, or removing tables, fields, or indexes',
    value: 'database',
  },
  {
    label: 'Data model changes, such as adding, modifying, or removing data models',
    value: 'model',
  },
  {
    label: 'Controller changes, such as adding, modifying, or removing controllers',
    value: 'controller',
  },
  {
    label: 'View changes, such as adding, modifying, or removing views',
    value: 'view',
  },
  {
    label: 'Route changes, such as adding, modifying, or removing routes',
    value: 'route',
  },
  {
    label: 'Test changes, such as adding, modifying, or removing test cases',
    value: 'test',
  },
];

const items: SelectInputItem[] = commitScopes.map((scope) => ({
  label: (
    <ListItem
      item={{
        desc: scope.label as string,
        name: scope.value,
        type: scope.value,
      }}
    />
  ),
  value: scope.value,
}));

const InputScope = memo(() => {
  const { message, setScope, setStep, scope } = useCommitStore(
    (st) => ({
      message: st.message,
      scope: st.scope,
      setScope: st.setScope,
      setStep: st.setStep,
    }),
    shallow,
  );
  useInput(useCallback((_, key) => key.tab && setStep('type'), []));
  const [isInput, setIsInput] = useState<boolean>(true);
  const [input, setInput] = useState<string>('');

  const handleSubmit = useCallback(() => {
    setStep('subject');
  }, []);

  const handleInput = useCallback(
    (e: string) => {
      if (isInput) {
        setScope(e);
        setInput(e);
      }
    },
    [isInput],
  );

  const handleSelect = useCallback((e: SelectInputItem) => {
    if (e.value === INPUT_VALUE) {
      setIsInput(true);
      setScope(input);
    } else {
      setIsInput(false);
      setScope(e.value);
    }
  }, []);

  return (
    <Panel
      footer={<Text>{message}</Text>}
      header={<Header step={2} steps={4} title="Input commit scope (optional)" />}
    >
      <TextInput
        defaultValue={scope}
        onChange={debounce(handleInput, 100)}
        onSubmit={handleSubmit}
        placeholder="Input commit <scope>, or select below, press [Enter] to skip..."
      />
      <SplitView>
        <SelectInput
          itemComponent={({ label }) => label}
          items={items}
          onHighlight={handleSelect}
          onSelect={handleSubmit}
        />
      </SplitView>
    </Panel>
  );
});

export default InputScope;
