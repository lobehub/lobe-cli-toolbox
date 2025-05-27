# Scripts Documentation

## update-models.ts

This script automatically updates the `packages/common/models.ts` file with the latest OpenAI model configurations from LobeChat's GitHub repository.

### What it does

1. **Fetches** the latest OpenAI configuration from LobeChat's repository
2. **Parses** the TypeScript configuration to extract chat model information
3. **Generates** a new `models.ts` file with:
   - Updated `LanguageModel` enum with all available models
   - `ModelTokens` record mapping models to their context window token counts
   - Default model selection (prioritizes latest mini models)

### Usage

```bash
# Run the script
npm run update-models

# Or directly with tsx
tsx scripts/update-models.ts
```

### Features

- ✅ **Automatic parsing** of TypeScript configuration files
- ✅ **Error handling** with detailed logging
- ✅ **Smart default model selection** (prefers o4-mini, gpt-4.1-mini, etc.)
- ✅ **Proper enum naming** (converts kebab-case to UPPER_SNAKE_CASE)
- ✅ **Token count formatting** with underscores for readability
- ✅ **Comprehensive logging** with emojis and progress indicators

### Output

The script generates a clean, formatted `models.ts` file with:

```typescript
export enum LanguageModel {
  /**
   * o3
   */
  O3 = 'o3',
  // ... more models
}

export const ModelTokens: Record<LanguageModel, number> = {
  [LanguageModel.O3]: 200_000,
  // ... more mappings
};

export const defaultModel = LanguageModel.O4_MINI;
```

### Configuration

The script fetches from:

- **Source**: `https://raw.githubusercontent.com/lobehub/lobe-chat/refs/heads/main/src/config/aiModels/openai.ts`
- **Target**: `packages/common/models.ts`

### Error Handling

The script includes robust error handling for:

- Network failures when fetching the remote configuration
- Parsing errors in the TypeScript configuration
- Missing or malformed model definitions
- File system write errors

### Logging

The script provides detailed logging including:

- 🚀 Process start
- 📥 Fetching remote configuration
- 🔍 Parsing model data
- ✅ Success with model count
- 📝 File generation
- 💾 File writing
- 📋 Complete list of updated models

### Dependencies

- `tsx` - For TypeScript execution
- Node.js built-in modules: `fs`, `https`, `path`
