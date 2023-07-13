declare module 'gitconfig' {
  interface GitConfigOptions {
    location?: 'global' | 'local';
  }

  interface GitConfig {
    get(options?: GitConfigOptions): Promise<GitConfigValues>;
    set(config: { [key: string]: string }, options?: GitConfigOptions): Promise<void>;
    unset(config: string[], options?: GitConfigOptions): Promise<void>;
  }

  interface GitConfigValues {
    branch?: { [key: string]: GitConfigBranch };
    core?: {
      bare?: boolean;
      filemode?: boolean;
      hookPath?: string;
      ignorecase?: boolean;
      logallrefupdates?: boolean;
      repositoryformatversion?: number;
    };
    pull?: {
      rebase?: boolean;
    };
    remote?: { origin: GitConfigRemote };
    user?: { email: string; name: string };
  }

  interface GitConfigRemote {
    fetch?: string;
    url: string;
  }

  interface GitConfigBranch {
    merge?: string;
    remote: string;
  }

  const gitconfig: GitConfig;
  export = gitconfig;
}
