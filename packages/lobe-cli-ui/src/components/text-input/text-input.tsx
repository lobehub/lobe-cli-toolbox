import { Text } from 'ink';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';
import { useTextInput } from './use-text-input';
import { useTextInputState } from './use-text-input-state';

export type TextInputProps = {
  /**
   * Default input value.
   */
  readonly defaultValue?: string;

  /**
   * When disabled, user input is ignored.
   *
   * @default false
   */
  readonly isDisabled?: boolean;

  /**
   * Callback when input value changes.
   */
  readonly onChange?: (value: string) => void;

  /**
   * Callback when enter is pressed. First argument is input value.
   */
  readonly onSubmit?: (value: string) => void;

  /**
   * Text to display when input is empty.
   */
  readonly placeholder?: string;

  /**
   * Suggestions to autocomplete the input value.
   */
  readonly suggestions?: string[];
};

export function TextInput({
  isDisabled = false,
  defaultValue,
  placeholder = '',
  suggestions,
  onChange,
  onSubmit,
}: TextInputProps) {
  const state = useTextInputState({
    defaultValue,
    onChange,
    onSubmit,
    suggestions,
  });

  const { inputValue } = useTextInput({
    isDisabled,
    placeholder,
    state,
  });

  const { styles } = useComponentTheme<Theme>('TextInput');

  return <Text {...styles.value()}>{inputValue}</Text>;
}
