/** Loads `.env` from the working directory without overriding variables that are already set. */
export const loadEnv = (path = '.env') => {
  try {
    process.loadEnvFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
};
