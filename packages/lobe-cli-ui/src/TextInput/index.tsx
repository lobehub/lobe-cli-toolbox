import { Box, Text, useInput } from 'ink';
import { memo, useRef, useState } from 'react';

import { useTheme } from '../hooks/useTheme';
import { editText, type TextEditState } from '../lib/textEdit';
import symbols from '../styles/symbols';

export interface TextInputProps {
  defaultValue?: string;
  isFocused?: boolean;
  /** Render every character as this one, e.g. `•` for secrets. */
  mask?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

/** Single-line input with a movable cursor and readline shortcuts (ctrl+a/e/u/k/w). */
export const TextInput = memo<TextInputProps>(
  ({ defaultValue = '', isFocused = true, mask, onChange, onSubmit, placeholder = '' }) => {
    const [state, setState] = useState<TextEditState>({
      cursor: defaultValue.length,
      value: defaultValue,
    });
    // Several keys can arrive before React re-renders (fast typing, paste), so edit the latest.
    const latestRef = useRef(state);

    useInput(
      (input, key) => {
        if (key.return) {
          onSubmit?.(latestRef.current.value);
          return;
        }
        const next = editText(latestRef.current, input, key);
        if (!next || next === latestRef.current) return;
        const changed = next.value !== latestRef.current.value;
        latestRef.current = next;
        setState(next);
        if (changed) onChange?.(next.value);
      },
      { isActive: isFocused },
    );

    const shown = mask ? mask.repeat(state.value.length) : state.value;

    if (!isFocused) {
      return shown ? <Text>{shown}</Text> : <Text dimColor>{placeholder}</Text>;
    }

    if (!shown) {
      return (
        <Text>
          <Text inverse> </Text>
          <Text dimColor>{placeholder}</Text>
        </Text>
      );
    }

    return (
      <Text>
        {shown.slice(0, state.cursor)}
        <Text inverse>{shown[state.cursor] ?? ' '}</Text>
        {shown.slice(state.cursor + 1)}
      </Text>
    );
  },
);

export const PasswordInput = memo<Omit<TextInputProps, 'mask'>>((props) => (
  <TextInput mask="•" {...props} />
));

export interface TextFieldProps extends TextInputProps {
  /** Shown under the input while there is no error. */
  description?: string;
  onCancel?: () => void;
  /** Return an error message to block submitting. */
  validate?: (value: string) => string | undefined;
}

/** `TextInput` with validation on enter and esc to cancel. */
export const TextField = memo<TextFieldProps>(
  ({ description, isFocused = true, onCancel, onChange, onSubmit, validate, ...props }) => {
    const theme = useTheme();
    const [error, setError] = useState<string>();

    useInput(
      (_, key) => {
        if (key.escape) onCancel?.();
      },
      { isActive: isFocused && !!onCancel },
    );

    return (
      <Box flexDirection="column">
        <TextInput
          {...props}
          isFocused={isFocused}
          onChange={(value) => {
            if (error) setError(undefined);
            onChange?.(value);
          }}
          onSubmit={(value) => {
            const message = validate?.(value);
            if (message) setError(message);
            else onSubmit?.(value);
          }}
        />
        {error ? (
          <Text color={theme.colorError}>{`${symbols.error} ${error}`}</Text>
        ) : (
          description && <Text dimColor>{description}</Text>
        )}
      </Box>
    );
  },
);

export default TextInput;
