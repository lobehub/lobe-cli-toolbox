import { Panel, SearchSelect, searchSelectHints, type SearchSelectItem } from '@lobehub/cli-ui';
import { kebabCase } from 'lodash-es';
import { memo, useMemo } from 'react';

import { useCommitStore } from '@/store/commitStore';

import Preview from './Preview';

const items: SearchSelectItem[] = [
  { hint: 'No scope', label: 'none', value: '' },
  { hint: 'Adding, updating or removing dependencies', label: 'deps', value: 'deps' },
  { hint: 'Configuration files and options', label: 'config', value: 'config' },
  { hint: 'Layout, style or interaction changes', label: 'ui', value: 'ui' },
  { hint: 'API endpoints', label: 'api', value: 'api' },
  { hint: 'Tables, fields or indexes', label: 'database', value: 'database' },
  { hint: 'Data models', label: 'model', value: 'model' },
  { hint: 'Controllers', label: 'controller', value: 'controller' },
  { hint: 'Views', label: 'view', value: 'view' },
  { hint: 'Routes', label: 'route', value: 'route' },
  { hint: 'Test cases', label: 'test', value: 'test' },
];

const ScopeStep = memo(() => {
  const scope = useCommitStore((st) => st.scope);
  const options = useMemo(
    () =>
      scope && !items.some((item) => item.value === scope)
        ? [items[0]!, { hint: 'Custom scope', label: scope, value: scope }, ...items.slice(1)]
        : items,
    [scope],
  );

  const handleSelect = (value: string) => {
    const { setScope, setStep } = useCommitStore.getState();
    setScope(value);
    setStep('subject');
  };

  return (
    <Panel hints={searchSelectHints} subtitle="optional" title="Scope">
      <SearchSelect
        allowCustom
        customLabel={(query) => `Use "${kebabCase(query)}"`}
        initialValue={scope}
        items={options}
        labelWidth={14}
        placeholder="Search or type a scope"
        onCancel={() => useCommitStore.getState().back()}
        onSelect={handleSelect}
      />
      <Preview />
    </Panel>
  );
});

export default ScopeStep;
