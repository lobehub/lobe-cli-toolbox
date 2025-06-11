import { Box, Text } from 'ink';
import { type ReactNode } from 'react';

import { useComponentTheme } from '../../theme';
import { type Option } from '../../types';
import { MultiSelectOption } from './multi-select-option';
import { type Theme } from './theme';
import { useMultiSelect } from './use-multi-select';
import { useMultiSelectState } from './use-multi-select-state';

export type MultiSelectProps = {
  /**
   * Initially selected option values.
   */
  readonly defaultValue?: string[];

  /**
   * Highlight text in option labels.
   * Useful for filtering options.
   */
  readonly highlightText?: string;

  /**
   * When disabled, user input is ignored.
   *
   * @default false
   */
  readonly isDisabled?: boolean;

  /**
   * Callback for selecting options.
   */
  readonly onChange?: (value: string[]) => void;

  /**
   * Callback when user presses enter.
   * First argument is an array of selected option values.
   */
  readonly onSubmit?: (value: string[]) => void;

  /**
   * Options.
   */
  readonly options: Option[];

  /**
   * Number of visible options.
   *
   * @default 5
   */
  readonly visibleOptionCount?: number;
};

export function MultiSelect({
  isDisabled = false,
  visibleOptionCount = 5,
  highlightText,
  options,
  defaultValue,
  onChange,
  onSubmit,
}: MultiSelectProps) {
  const state = useMultiSelectState({
    defaultValue,
    onChange,
    onSubmit,
    options,
    visibleOptionCount,
  });

  useMultiSelect({ isDisabled, state });

  const { styles } = useComponentTheme<Theme>('MultiSelect');

  return (
    <Box {...styles.container()}>
      {state.visibleOptions.map((option) => {
        // eslint-disable-next-line prefer-destructuring
        let label: ReactNode = option.label;

        if (highlightText && option.label.includes(highlightText)) {
          const index = option.label.indexOf(highlightText);

          label = (
            <>
              {option.label.slice(0, index)}
              <Text {...styles.highlightedText()}>{highlightText}</Text>
              {option.label.slice(index + highlightText.length)}
            </>
          );
        }

        return (
          <MultiSelectOption
            isFocused={!isDisabled && state.focusedValue === option.value}
            isSelected={state.value.includes(option.value)}
            key={option.value}
          >
            {label}
          </MultiSelectOption>
        );
      })}
    </Box>
  );
}
