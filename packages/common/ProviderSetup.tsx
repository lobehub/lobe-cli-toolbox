import { PasswordInput, Spinner, TextInput } from '@lobehub/cli-ui';
import { Box, Text, useInput } from 'ink';
import { memo, useEffect, useMemo, useState } from 'react';

import SearchSelect, { type SearchSelectItem } from './SearchSelect';
import { listModels } from './llm';
import {
  API_TYPES,
  type ApiType,
  CUSTOM_PROVIDER,
  PROVIDERS,
  type ResolvedProviderConfig,
  getDefaultBaseURL,
  getProviderApiTypes,
  getProviderPreset,
  providerIds,
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

interface ModelStepProps {
  connection: Pick<ProviderSetupValue, 'apiKey' | 'apiType' | 'baseURL'>;
  initialValue?: string;
  onSelect: (model: string) => void;
}

const ModelStep = memo<ModelStepProps>(({ connection, initialValue, onSelect }) => {
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

  const items = useMemo(() => {
    const list = models || [];
    const all = initialValue && !list.includes(initialValue) ? [initialValue, ...list] : list;
    return all.map((model) => ({ label: model, value: model }));
  }, [models, initialValue]);

  if (!models) return <Spinner label="Fetching model list..." />;

  return (
    <Box flexDirection="column">
      {error && (
        <Text color="yellow">{`Can't fetch model list (${error}), type the model id instead.`}</Text>
      )}
      <SearchSelect
        allowCustom
        initialValue={initialValue}
        items={items}
        onSelect={onSelect}
        placeholder="Search or type a model id"
      />
    </Box>
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

  useInput((_, key) => {
    if (!key.escape) return;
    const prev = history.at(-1);
    if (!prev) return onCancel();
    setHistory((list) => list.slice(0, -1));
    setStep(prev);
  });

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

  const selectModel = (model: string) => {
    onSubmit({ ...value, model });
  };

  const title = {
    apiKey: 'API key',
    apiType: 'API type',
    baseURL: 'API base URL',
    model: 'Model',
    provider: 'Provider',
  }[step];

  const steps: Step[] =
    mode === 'model' ? ['model'] : ['provider', 'apiType', 'baseURL', 'apiKey', 'model'];

  const renderStep = () => {
    switch (step) {
      case 'provider': {
        return (
          <SearchSelect
            initialValue={value.provider}
            items={PROVIDER_ITEMS}
            key="provider"
            onSelect={selectProvider}
            placeholder="Search provider"
          />
        );
      }
      case 'apiType': {
        return (
          <SearchSelect
            initialValue={value.apiType}
            items={getProviderApiTypes(value.provider).map((type) => ({
              label: API_TYPES[type].name,
              value: type,
            }))}
            key="apiType"
            onSelect={selectApiType}
          />
        );
      }
      case 'baseURL': {
        return (
          <Box flexDirection="column">
            <TextInput
              defaultValue={value.baseURL}
              key="baseURL"
              onSubmit={submitBaseURL}
              placeholder={getDefaultBaseURL(value.provider, value.apiType)}
            />
            <Text dimColor>Enter to confirm · esc back</Text>
          </Box>
        );
      }
      case 'apiKey': {
        const envHint = preset?.apiKeyEnv?.join(' / ');
        return (
          <Box flexDirection="column">
            <PasswordInput
              key="apiKey"
              onSubmit={submitApiKey}
              placeholder={
                value.apiKey
                  ? 'Press enter to keep the current key'
                  : `Input API key${envHint ? `, or leave empty to use ${envHint}` : ''}`
              }
            />
            <Text dimColor>Enter to confirm · esc back</Text>
          </Box>
        );
      }
      case 'model': {
        return (
          <ModelStep
            connection={value}
            initialValue={value.model || undefined}
            onSelect={selectModel}
          />
        );
      }
    }
  };

  return (
    <Box flexDirection="column">
      {mode === 'full' && (
        <Box marginBottom={1}>
          <Text dimColor>
            {steps
              .filter((s) => s !== 'apiType' || getProviderApiTypes(value.provider).length > 1)
              .filter((s) => s !== 'apiKey' || !preset?.noApiKey)
              .map((s) => (s === step ? `[${title}]` : s))
              .join(' → ')}
          </Text>
        </Box>
      )}
      {renderStep()}
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
