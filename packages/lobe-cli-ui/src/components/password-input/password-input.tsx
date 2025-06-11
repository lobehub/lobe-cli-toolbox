import { Text } from 'ink';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';
import { usePasswordInput } from './use-password-input';
import { usePasswordInputState } from './use-password-input-state';

export type PasswordInputProps = {
  /**
   * When disabled, user input is ignored.
   *
   * @default false
   */
  readonly isDisabled?: boolean;

  /**
   * Callback when value updates.
   */
  readonly onChange?: (value: string) => void;

  /**
   * Callback when `Enter` is pressed. First argument is a value of the input.
   */
  readonly onSubmit?: (value: string) => void;

  /**
   * Text to display when `value` is empty.
   */
  readonly placeholder?: string;
};

export function PasswordInput({
  isDisabled = false,
  placeholder = '',
  onChange,
  onSubmit,
}: PasswordInputProps) {
  const state = usePasswordInputState({
    onChange,
    onSubmit,
  });

  const { inputValue } = usePasswordInput({
    isDisabled,
    placeholder,
    state,
  });

  const { styles } = useComponentTheme<Theme>('PasswordInput');

  return <Text {...styles.value()}>{inputValue}</Text>;
}
