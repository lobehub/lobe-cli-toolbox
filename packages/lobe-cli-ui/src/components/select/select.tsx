import { Box, Text } from 'ink';
import { type ReactNode } from 'react';

import { useComponentTheme } from '../../theme';
import { type Option } from '../../types';
import { SelectOption } from './select-option';
import { type Theme } from './theme';
import { useSelect } from './use-select';
import { useSelectState } from './use-select-state';

export type SelectProps = {
  /**
   * Default value.
   */
  readonly defaultValue?: string;

  /**
   * Highlight text in option labels.
   */
  readonly highlightText?: string;

  /**
   * When disabled, user input is ignored.
   *
   * @default false
   */
  readonly isDisabled?: boolean;

  /**
   * Callback when selected option changes.
   */
  readonly onChange?: (value: string) => void;

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

export function Select({
  isDisabled = false,
  visibleOptionCount = 5,
  highlightText,
  options,
  defaultValue,
  onChange,
}: SelectProps) {
  const state = useSelectState({
    defaultValue,
    onChange,
    options,
    visibleOptionCount,
  });

  useSelect({ isDisabled, state });

  const { styles } = useComponentTheme<Theme>('Select');

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
          <SelectOption
            isFocused={!isDisabled && state.focusedValue === option.value}
            isSelected={state.value === option.value}
            key={option.value}
          >
            {label}
          </SelectOption>
        );
      })}
    </Box>
  );
}
