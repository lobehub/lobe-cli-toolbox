import { kebabCase } from 'lodash-es';
import { createWithEqualityFn } from 'zustand/traditional';

import { commitMessageToObj, commitObjToMessage, type IssuesType } from '@/utils/genCommitMessage';
import getIssuesList, { type Issue, type IssuesResult } from '@/utils/getIssuesList';

export type Step = 'type' | 'scope' | 'subject' | 'issues' | 'issuesType' | 'ai';

export type IssuesStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

/** Where esc leads from each step; `type` is the first step. */
const PREVIOUS_STEP: Record<Step, Step | undefined> = {
  ai: 'type',
  issues: 'subject',
  issuesType: 'issues',
  scope: 'type',
  subject: 'scope',
  type: undefined,
};

export interface CommitStore {
  /** Goes to the previous step, returns `false` on the first step. */
  back: () => boolean;
  body: string;
  emoji: string;
  /** Loads open issues once; later calls are no-ops. */
  fetchIssuesList: () => Promise<void>;
  issueList: Issue[];
  issues: string;
  /** Why the issue list is unavailable. */
  issuesError?: string;
  issuesStatus: IssuesStatus;
  issuesType: IssuesType;
  message: string;
  scope: string;
  setEmoji: (emoji: string) => void;
  setIssues: (issues: string) => void;
  setIssuesType: (type: IssuesType) => void;
  /** Parses a full message (e.g. from AI) into the fields. */
  setMessage: (message: string) => void;
  setScope: (scope: string) => void;
  setStep: (step: Step) => void;
  setSubject: (subject: string) => void;
  setType: (type: string) => void;
  step: Step;
  subject: string;
  type: string;
}

export const getIssuesErrorMessage = (error: IssuesResult['error']): string => {
  switch (error) {
    case 'NO_TOKEN': {
      return 'Add a GitHub token with `lobe-commit --option` or GITHUB_TOKEN to pick from open issues';
    }
    case 'INVALID_TOKEN': {
      return 'The GitHub token is invalid';
    }
    case 'PERMISSION_DENIED': {
      return 'No access to the repository issues';
    }
    case 'TIMEOUT': {
      return 'GitHub did not respond in time';
    }
    case 'NETWORK_ERROR': {
      return 'Could not reach GitHub';
    }
    case 'NO_REPO': {
      return 'The origin remote is not a GitHub repository';
    }
    default: {
      return 'Could not load issues';
    }
  }
};

export const useCommitStore = createWithEqualityFn<CommitStore>((set, get) => {
  const update = (patch: Partial<CommitStore>) => {
    const next = { ...get(), ...patch };
    set({
      ...patch,
      message: commitObjToMessage({
        body: next.body,
        emoji: next.emoji,
        issues: next.issues,
        issuesType: next.issuesType,
        scope: next.scope,
        subject: next.subject,
        type: next.type,
      }),
    });
  };

  return {
    back: () => {
      const previous = PREVIOUS_STEP[get().step];
      if (!previous) return false;
      set({ step: previous });
      return true;
    },
    body: '',
    emoji: '',
    fetchIssuesList: async () => {
      if (get().issuesStatus !== 'idle') return;
      set({ issuesStatus: 'loading' });
      const result = await getIssuesList();
      if (result.success && result.data && result.data.length > 0) {
        set({ issueList: result.data, issuesStatus: 'ready' });
      } else {
        set({
          issuesError: result.success ? 'No open issues' : getIssuesErrorMessage(result.error),
          issuesStatus: 'unavailable',
        });
      }
    },
    issueList: [],
    issues: '',
    issuesStatus: 'idle',
    issuesType: '',
    message: '',
    scope: '',
    setEmoji: (emoji) => update({ emoji }),
    setIssues: (issues) => update({ issues }),
    setIssuesType: (issuesType) => update({ issuesType }),
    setMessage: (message) => {
      const {
        body = '',
        emoji = '',
        issues = '',
        scope = '',
        subject,
        type,
      } = commitMessageToObj(message);
      update({ body, emoji, issues, scope, subject, type });
    },
    setScope: (scope) => update({ scope: kebabCase(scope) }),
    setStep: (step) => set({ step }),
    setSubject: (subject) => update({ subject }),
    setType: (type) => update({ type }),
    step: 'type',
    subject: '',
    type: '',
  };
});
