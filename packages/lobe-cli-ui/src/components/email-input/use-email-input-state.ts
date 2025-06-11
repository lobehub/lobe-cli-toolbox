import { type Reducer, useCallback, useEffect, useMemo, useReducer } from 'react';

type State = {
  cursorOffset: number;
  previousValue: string;
  value: string;
};

type Action = MoveCursorLeftAction | MoveCursorRightAction | InsertAction | DeleteAction;

type MoveCursorLeftAction = {
  type: 'move-cursor-left';
};

type MoveCursorRightAction = {
  type: 'move-cursor-right';
};

type InsertAction = {
  text: string;
  type: 'insert';
};

type DeleteAction = {
  type: 'delete';
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'move-cursor-left': {
      return {
        ...state,
        cursorOffset: Math.max(0, state.cursorOffset - 1),
      };
    }

    case 'move-cursor-right': {
      return {
        ...state,
        cursorOffset: Math.min(state.value.length, state.cursorOffset + 1),
      };
    }

    case 'insert': {
      if (state.value.includes('@') && action.text.includes('@')) {
        return state;
      }

      return {
        ...state,
        cursorOffset: state.cursorOffset + action.text.length,
        previousValue: state.value,
        value:
          state.value.slice(0, state.cursorOffset) +
          action.text +
          state.value.slice(state.cursorOffset),
      };
    }

    case 'delete': {
      const newCursorOffset = Math.max(0, state.cursorOffset - 1);

      return {
        ...state,
        cursorOffset: newCursorOffset,
        previousValue: state.value,
        value: state.value.slice(0, newCursorOffset) + state.value.slice(newCursorOffset + 1),
      };
    }
  }
};

export type UseEmailInputStateProps = {
  /**
   * Initial value to display in a text input.
   */
  defaultValue?: string;

  /**
   * Domains of email providers to auto complete.
   *
   * @default ["aol.com", "gmail.com", "yahoo.com", "hotmail.com", "live.com", "outlook.com", "icloud.com", "hey.com"]
   */
  domains?: string[];

  /**
   * Callback when value updates.
   */
  onChange?: (value: string) => void;

  /**
   * Callback when `Enter` is pressed. First argument is a value of the input.
   */
  onSubmit?: (value: string) => void;
};

export type EmailInputState = State & {
  /**
   * Delete character.
   */
  delete: () => void;

  /**
   * Insert text.
   */
  insert: (text: string) => void;

  /**
   * Move cursor to the left.
   */
  moveCursorLeft: () => void;

  /**
   * Move cursor to the right.
   */
  moveCursorRight: () => void;

  /**
   * Submit input value.
   */
  submit: () => void;

  /**
   * Suggested auto completion.
   */
  suggestion: string | undefined;
};

export const useEmailInputState = ({
  defaultValue = '',
  domains = [
    'aol.com',
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'live.com',
    'outlook.com',
    'icloud.com',
    'hey.com',
  ],
  onChange,
  onSubmit,
}: UseEmailInputStateProps) => {
  const [state, dispatch] = useReducer(reducer, {
    cursorOffset: defaultValue.length,
    previousValue: defaultValue,
    value: defaultValue,
  });

  const suggestion = useMemo(() => {
    if (state.value.length === 0 || !state.value.includes('@')) {
      return;
    }

    const atIndex = state.value.indexOf('@');
    const enteredDomain = state.value.slice(atIndex + 1);

    return domains?.find((domain) => domain.startsWith(enteredDomain))?.replace(enteredDomain, '');
  }, [state.value, domains]);

  const moveCursorLeft = useCallback(() => {
    dispatch({
      type: 'move-cursor-left',
    });
  }, []);

  const moveCursorRight = useCallback(() => {
    dispatch({
      type: 'move-cursor-right',
    });
  }, []);

  const insert = useCallback((text: string) => {
    dispatch({
      text,
      type: 'insert',
    });
  }, []);

  const deleteCharacter = useCallback(() => {
    dispatch({
      type: 'delete',
    });
  }, []);

  const submit = useCallback(() => {
    if (suggestion) {
      insert(suggestion);
      onSubmit?.(state.value + suggestion);
      return;
    }

    onSubmit?.(state.value);
  }, [state.value, suggestion, insert, onSubmit]);

  useEffect(() => {
    if (state.previousValue !== state.value) {
      onChange?.(state.value);
    }
  }, [state.previousValue, state.value, onChange]);

  return {
    ...state,
    delete: deleteCharacter,
    insert,
    moveCursorLeft,
    moveCursorRight,
    submit,
    suggestion,
  };
};
