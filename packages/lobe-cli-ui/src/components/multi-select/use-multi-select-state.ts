import { isDeepStrictEqual } from 'node:util';
import { type Reducer, useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import OptionMap from '../../lib/option-map';
import { type Option } from '../../types';

type State = {
  /**
   * Value of the currently focused option.
   */
  focusedValue: string | undefined;

  /**
   * Map where key is option's value and value is option's index.
   */
  optionMap: OptionMap;

  /**
   * Values of previously selected options.
   */
  previousValue: string[];

  /**
   * Indexes of selected options.
   */
  value: string[];

  /**
   * Index of the first visible option.
   */
  visibleFromIndex: number;

  /**
   * Number of visible options.
   */
  visibleOptionCount: number;

  /**
   * Index of the last visible option.
   */
  visibleToIndex: number;
};

type Action =
  | FocusNextOptionAction
  | FocusPreviousOptionAction
  | ToggleFocusedOptionAction
  | ResetAction;

type FocusNextOptionAction = {
  type: 'focus-next-option';
};

type FocusPreviousOptionAction = {
  type: 'focus-previous-option';
};

type ToggleFocusedOptionAction = {
  type: 'toggle-focused-option';
};

type ResetAction = {
  state: State;
  type: 'reset';
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'focus-next-option': {
      if (!state.focusedValue) {
        return state;
      }

      const item = state.optionMap.get(state.focusedValue);

      if (!item) {
        return state;
      }

      // eslint-disable-next-line prefer-destructuring
      const next = item.next;

      if (!next) {
        return state;
      }

      const needsToScroll = next.index >= state.visibleToIndex;

      if (!needsToScroll) {
        return {
          ...state,
          focusedValue: next.value,
        };
      }

      const nextVisibleToIndex = Math.min(state.optionMap.size, state.visibleToIndex + 1);

      const nextVisibleFromIndex = nextVisibleToIndex - state.visibleOptionCount;

      return {
        ...state,
        focusedValue: next.value,
        visibleFromIndex: nextVisibleFromIndex,
        visibleToIndex: nextVisibleToIndex,
      };
    }

    case 'focus-previous-option': {
      if (!state.focusedValue) {
        return state;
      }

      const item = state.optionMap.get(state.focusedValue);

      if (!item) {
        return state;
      }

      // eslint-disable-next-line prefer-destructuring
      const previous = item.previous;

      if (!previous) {
        return state;
      }

      const needsToScroll = previous.index <= state.visibleFromIndex;

      if (!needsToScroll) {
        return {
          ...state,
          focusedValue: previous.value,
        };
      }

      const nextVisibleFromIndex = Math.max(0, state.visibleFromIndex - 1);

      const nextVisibleToIndex = nextVisibleFromIndex + state.visibleOptionCount;

      return {
        ...state,
        focusedValue: previous.value,
        visibleFromIndex: nextVisibleFromIndex,
        visibleToIndex: nextVisibleToIndex,
      };
    }

    case 'toggle-focused-option': {
      if (!state.focusedValue) {
        return state;
      }

      if (state.value.includes(state.focusedValue)) {
        const newValue = new Set(state.value);
        newValue.delete(state.focusedValue);

        return {
          ...state,
          previousValue: state.value,
          value: [...newValue],
        };
      }

      return {
        ...state,
        previousValue: state.value,
        value: [...state.value, state.focusedValue],
      };
    }

    case 'reset': {
      return action.state;
    }
  }
};

export type UseMultiSelectStateProps = {
  /**
   * Initially selected option values.
   */
  defaultValue?: string[];

  /**
   * Callback for selecting options.
   */
  onChange?: (value: string[]) => void;

  /**
   * Callback when user presses enter.
   * First argument is an array of selected option values.
   */
  onSubmit?: (value: string[]) => void;

  /**
   * Options.
   */
  options: Option[];

  /**
   * Number of visible options.
   *
   * @default 5
   */
  visibleOptionCount?: number;
};

export type MultiSelectState = Pick<
  State,
  'focusedValue' | 'visibleFromIndex' | 'visibleToIndex' | 'value'
> & {
  /**
   * Focus next option and scroll the list down, if needed.
   */
  focusNextOption: () => void;

  /**
   * Focus previous option and scroll the list up, if needed.
   */
  focusPreviousOption: () => void;

  /**
   * Trigger `onSubmit` callback.
   */
  submit: () => void;

  /**
   * Select currently focused option.
   */
  toggleFocusedOption: () => void;

  /**
   * Visible options.
   */
  visibleOptions: Array<Option & { index: number }>;
};

const createDefaultState = ({
  visibleOptionCount: customVisibleOptionCount,
  defaultValue,
  options,
}: Pick<UseMultiSelectStateProps, 'visibleOptionCount' | 'defaultValue' | 'options'>) => {
  const visibleOptionCount =
    typeof customVisibleOptionCount === 'number'
      ? Math.min(customVisibleOptionCount, options.length)
      : options.length;

  const optionMap = new OptionMap(options);
  const value = defaultValue ?? [];

  return {
    focusedValue: optionMap.first?.value,
    optionMap,
    previousValue: value,
    value,
    visibleFromIndex: 0,
    visibleOptionCount,
    visibleToIndex: visibleOptionCount,
  };
};

export const useMultiSelectState = ({
  visibleOptionCount = 5,
  options,
  defaultValue,
  onChange,
  onSubmit,
}: UseMultiSelectStateProps) => {
  const [state, dispatch] = useReducer(
    reducer,
    { defaultValue, options, visibleOptionCount },
    createDefaultState,
  );

  const [lastOptions, setLastOptions] = useState(options);

  if (options !== lastOptions && !isDeepStrictEqual(options, lastOptions)) {
    dispatch({
      state: createDefaultState({ defaultValue, options, visibleOptionCount }),
      type: 'reset',
    });

    setLastOptions(options);
  }

  const focusNextOption = useCallback(() => {
    dispatch({
      type: 'focus-next-option',
    });
  }, []);

  const focusPreviousOption = useCallback(() => {
    dispatch({
      type: 'focus-previous-option',
    });
  }, []);

  const toggleFocusedOption = useCallback(() => {
    dispatch({
      type: 'toggle-focused-option',
    });
  }, []);

  const submit = useCallback(() => {
    onSubmit?.(state.value);
  }, [state.value, onSubmit]);

  const visibleOptions = useMemo(() => {
    return options
      .map((option, index) => ({
        ...option,
        index,
      }))
      .slice(state.visibleFromIndex, state.visibleToIndex);
  }, [options, state.visibleFromIndex, state.visibleToIndex]);

  useEffect(() => {
    if (!isDeepStrictEqual(state.previousValue, state.value)) {
      onChange?.(state.value);
    }
  }, [state.previousValue, state.value, options, onChange]);

  return {
    focusNextOption,
    focusPreviousOption,
    focusedValue: state.focusedValue,
    submit,
    toggleFocusedOption,
    value: state.value,
    visibleFromIndex: state.visibleFromIndex,
    visibleOptions,
    visibleToIndex: state.visibleToIndex,
  };
};
