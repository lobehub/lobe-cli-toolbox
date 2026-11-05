import {
  KeyHints,
  SearchSelect,
  searchSelectHints,
  type SearchSelectItem,
  Spinner,
  symbols,
  TextField,
  useTheme,
} from '@lobehub/cli-ui';
import { Box, Text, useInput } from 'ink';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';

import { listModels } from './llm';
import {
  API_TYPES,
  type ApiType,
  CUSTOM_PROVIDER,
  getDefaultBaseURL,
  getProviderApiTypes,
  getProviderPreset,
  providerIds,
  PROVIDERS,
  type ResolvedProviderConfig,
  resolveProviderConfig,
} from './providers';

export interface ProviderSetupValue {
  apiKey: string;
  /**
   * Whether the key was typed in the setup, otherwise it comes from env or the saved config.
   */
  apiKeyChanged: boolean;
  apiType: ApiType;
  baseURL: string;
  model: string;
  provider: string;
}

export interface ProviderSetupProps {
  /**
   * The effective config, used as defaults and to keep the stored key.
   */
  current: ResolvedProviderConfig;
  /**
   * `model` only asks for the model with the current connection.
   */
  mode?: 'full' | 'model';
  onCancel: () => void;
  onSubmit: (value: ProviderSetupValue) => void;
}

type Step = 'provider' | 'apiType' | 'baseURL' | 'apiKey' | 'model';

const STEP_TITLES: Record<Step, string> = {
  apiKey: 'API key',
  apiType: 'API type',
  baseURL: 'Base URL',
  model: 'Model',
  provider: 'Provider',
};

const INPUT_HINTS = [
  ['enter', 'confirm'],
  ['esc', 'back'],
] as const;

const PROVIDER_ITEMS: SearchSelectItem[] = [
  ...providerIds.map((id) => ({
    hint: Object.keys(PROVIDERS[id].endpoints)
      .map((type) => API_TYPES[type as ApiType].name.split(' (')[0])
      .join(' / '),
    label: PROVIDERS[id].name,
    value: id,
  })),
  {
    hint: 'Any endpoint: Chat Completions / Responses / Anthropic / Gemini',
    label: 'Custom',
    value: CUSTOM_PROVIDER,
  },
];

const PROVIDER_LABEL_WIDTH = Math.max(...PROVIDER_ITEMS.map((item) => item.label.length)) + 3;

const validateURL = (input: string) => {
  if (!input.trim()) return;
  try {
    const url = new URL(input.trim());
    if (url.protocol === 'http:' || url.protocol === 'https:') return;
  } catch {
    /* falls through */
  }
  return 'Enter a full http(s):// URL';
};

interface ModelStepProps {
  connection: Pick<ProviderSetupValue, 'apiKey' | 'apiType' | 'baseURL'>;
  initialValue?: string;
  onCancel: () => void;
  onSelect: (model: string) => void;
}

const ModelStep = memo<ModelStepProps>(({ connection, initialValue, onCancel, onSelect }) => {
  const theme = useTheme();
  const [models, setModels] = useState<string[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    listModels(connection)
      .then((list) => !cancelled && setModels(list))
      .catch((error_) => {
        if (cancelled) return;
        setError(String(error_?.message || error_));
        setModels([]);
      });
    return () => {
      cancelled = true;
    };
  }, [connection.apiKey, connection.apiType, connection.baseURL]);

  useInput((_, key) => key.escape && onCancel(), { isActive: !models });

  const items = useMemo(() => {
    const list = models || [];
    const all = initialValue && !list.includes(initialValue) ? [initialValue, ...list] : list;
    return all.map((model) => ({ label: model, value: model }));
  }, [models, initialValue]);

  if (!models) return <Spinner label={`Fetching models from ${connection.baseURL}`} />;

  return (
    <Box flexDirection="column">
      {error && (
        <Box marginBottom={1}>
          <Text
            color={theme.colorWarning}
          >{`${symbols.warning} Can't fetch the model list (${error}), type a model id instead`}</Text>
        </Box>
      )}
      <SearchSelect
        allowCustom
        customLabel={(query) => `Use model "${query}"`}
        emptyText="Type a model id"
        initialValue={initialValue}
        items={items}
        placeholder={`Search ${models.length} models or type an id`}
        onCancel={onCancel}
        onSelect={onSelect}
      />
    </Box>
  );
});

const Breadcrumb = memo<{ current: Step; steps: Step[] }>(({ current, steps }) => {
  const theme = useTheme();
  const currentIndex = steps.indexOf(current);
  return (
    <Text wrap="truncate-end">
      {steps.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && <Text dimColor>{' › '}</Text>}
          {index < currentIndex ? (
            <Text color={theme.colorSuccess}>{`${symbols.tick} ${STEP_TITLES[step]}`}</Text>
          ) : index === currentIndex ? (
            <Text bold color={theme.colorPrimary}>
              {STEP_TITLES[step]}
            </Text>
          ) : (
            <Text dimColor>{STEP_TITLES[step]}</Text>
          )}
        </Fragment>
      ))}
    </Text>
  );
});

const ProviderSetup = memo<ProviderSetupProps>(({ current, mode = 'full', onCancel, onSubmit }) => {
  const [value, setValue] = useState<ProviderSetupValue>({
    apiKey: current.apiKey,
    apiKeyChanged: false,
    apiType: current.apiType,
    baseURL: current.baseURL,
    model: current.model,
    provider: current.provider,
  });
  const [history, setHistory] = useState<Step[]>([]);
  const [step, setStep] = useState<Step>(mode === 'model' ? 'model' : 'provider');

  const preset = getProviderPreset(value.provider);
  const isSameProvider = value.provider === current.provider;

  const goto = (next: Step, patch: Partial<ProviderSetupValue> = {}) => {
    setValue((prev) => ({ ...prev, ...patch }));
    setHistory((prev) => [...prev, step]);
    setStep(next);
  };

  const back = () => {
    const prev = history.at(-1);
    if (!prev) return onCancel();
    setHistory((list) => list.slice(0, -1));
    setStep(prev);
  };

  const selectProvider = (provider: string) => {
    const types = getProviderApiTypes(provider);
    const keep = provider === current.provider && types.includes(current.apiType);
    const apiType = keep ? current.apiType : types[0]!;
    const patch = {
      apiKey:
        provider === current.provider ? current.apiKey : resolveProviderConfig({ provider }).apiKey,
      apiKeyChanged: false,
      apiType,
      baseURL: keep ? current.baseURL : getDefaultBaseURL(provider, apiType),
      model:
        provider === current.provider ? current.model : getProviderPreset(provider)?.defaultModel,
      provider,
    } as ProviderSetupValue;
    goto(types.length > 1 ? 'apiType' : 'baseURL', patch);
  };

  const selectApiType = (apiType: string) => {
    const type = apiType as ApiType;
    const baseURL =
      isSameProvider && type === current.apiType
        ? current.baseURL
        : getDefaultBaseURL(value.provider, type);
    goto('baseURL', { apiType: type, baseURL });
  };

  const submitBaseURL = (input: string) => {
    const baseURL = (input.trim() || value.baseURL).replace(/\/+$/, '');
    goto(preset?.noApiKey ? 'model' : 'apiKey', { baseURL });
  };

  const submitApiKey = (input: string) => {
    const typed = input.trim();
    goto('model', typed ? { apiKey: typed, apiKeyChanged: true } : {});
  };

  const steps: Step[] =
    mode === 'model'
      ? ['model']
      : (['provider', 'apiType', 'baseURL', 'apiKey', 'model'] as Step[])
          .filter((s) => s !== 'apiType' || getProviderApiTypes(value.provider).length > 1)
          .filter((s) => s !== 'apiKey' || !preset?.noApiKey);

  const renderStep = () => {
    switch (step) {
      case 'provider': {
        return (
          <SearchSelect
            initialValue={value.provider}
            items={PROVIDER_ITEMS}
            key="provider"
            labelWidth={PROVIDER_LABEL_WIDTH}
            placeholder="Search provider"
            onCancel={back}
            onSelect={selectProvider}
          />
        );
      }
      case 'apiType': {
        return (
          <SearchSelect
            initialValue={value.apiType}
            key="apiType"
            placeholder="Search API type"
            items={getProviderApiTypes(value.provider).map((type) => ({
              label: API_TYPES[type].name,
              value: type,
            }))}
            onCancel={back}
            onSelect={selectApiType}
          />
        );
      }
      case 'baseURL': {
        return (
          <TextField
            defaultValue={value.baseURL}
            description="Leave empty to use the default endpoint"
            key="baseURL"
            placeholder={getDefaultBaseURL(value.provider, value.apiType)}
            validate={validateURL}
            onCancel={back}
            onSubmit={submitBaseURL}
          />
        );
      }
      case 'apiKey': {
        const envHint = preset?.apiKeyEnv?.join(' / ');
        return (
          <TextField
            key="apiKey"
            mask="•"
            placeholder={value.apiKey ? 'Paste a new key to replace it' : 'Paste your API key'}
            description={
              value.apiKey
                ? 'A key is already set, press enter to keep it'
                : envHint && `Leave empty to read it from ${envHint}`
            }
            onCancel={back}
            onSubmit={submitApiKey}
          />
        );
      }
      case 'model': {
        return (
          <ModelStep
            connection={value}
            initialValue={value.model || undefined}
            onCancel={back}
            onSelect={(model) => onSubmit({ ...value, model })}
          />
        );
      }
    }
  };

  const isSelect = step === 'provider' || step === 'apiType' || step === 'model';

  return (
    <Box flexDirection="column">
      {steps.length > 1 && (
        <Box marginBottom={1}>
          <Breadcrumb current={step} steps={steps} />
        </Box>
      )}
      {renderStep()}
      <Box marginTop={1}>
        <KeyHints hints={isSelect ? searchSelectHints : [...INPUT_HINTS]} />
      </Box>
    </Box>
  );
});

export default ProviderSetup;

type ProviderConfigKey = 'apiBaseUrl' | 'apiType' | 'modelName' | 'openaiToken' | 'provider';

/**
 * Persist a finished setup with the config keys shared by all CLIs.
 */
export const saveProviderSetup = (
  value: ProviderSetupValue,
  current: Pick<ResolvedProviderConfig, 'provider'>,
  set: (key: ProviderConfigKey, value: string) => void,
) => {
  set('provider', value.provider);
  set('apiType', value.apiType);
  set('apiBaseUrl', value.baseURL);
  set('modelName', value.model);
  if (value.apiKeyChanged) set('openaiToken', value.apiKey);
  else if (value.provider !== current.provider) set('openaiToken', '');
};
