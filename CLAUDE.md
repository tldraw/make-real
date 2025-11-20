# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Make Real is a Next.js application that transforms hand-drawn wireframes into working HTML prototypes using AI. Built on the tldraw SDK, it allows users to draw UI mockups on a canvas and generate interactive HTML/CSS/JavaScript implementations via OpenAI, Anthropic, or Google AI models.

Live at: https://makereal.tldraw.com

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint
```

The dev server runs on http://localhost:3000 by default.

## Architecture

### Core Flow

1. **Canvas Drawing** - User draws wireframes on tldraw canvas (app/makereal.tldraw.com/page.tsx)
2. **Shape Capture** - Selected shapes are captured as images (app/hooks/useMakeReal.ts)
3. **AI Processing** - Images + prompts sent to AI provider APIs (app/makereal.tldraw.com/api/)
4. **Preview Rendering** - Generated HTML rendered in PreviewShape iframe (app/PreviewShape/PreviewShape.tsx)
5. **Link Upload** - HTML uploaded to Vercel Blob for sharing (app/lib/uploadLink.tsx)

### Key Components

**useMakeReal Hook** (app/hooks/useMakeReal.ts)
- Main orchestration logic for the "Make Real" feature
- Validates API keys via settings
- Captures selected shapes as JPEG images (max 1000px)
- Creates PreviewShape components for each provider
- Streams HTML responses in real-time, updating preview as content arrives
- Handles errors and displays toasts to user
- Supports iterative refinement (passing previous HTML to AI)

**PreviewShape** (app/PreviewShape/PreviewShape.tsx)
- Custom tldraw shape that displays generated HTML in an iframe
- Shows loading spinner while streaming HTML
- Enables interaction mode (double-click to interact with preview)
- Provides dropdown menu for copying HTML/URL or opening in new window
- Supports SVG export by requesting screenshots from iframe content

**Settings System** (app/lib/settings.tsx)
- Manages API keys for all providers (OpenAI, Anthropic, Google)
- Stores model selection per provider (default: gpt-5, claude-sonnet-4-5, gemini-3-pro-preview)
- Handles settings migrations between versions (currently v12)
- Settings persisted in localStorage as `makereal_settings_2`
- Supports provider-specific custom prompts

**Prompt Engineering** (app/prompt.ts)
- Contains system and user prompts for AI models
- Current version: NOVEMBER_19_2025 (detailed instructions for transforming wireframes)
- Key instruction: hand-drawn elements should be "rectified" into clean UI components
- Prompts emphasize treating red annotations as instructions, not design elements
- Specifies technical constraints (single HTML file, Tailwind CSS, functional JavaScript)
- Legacy prompts preserved for reference (LEGACY_SYSTEM_PROMPT, IMPROVED_ORIGINAL)

### API Routes

Each AI provider has a dedicated API route under `app/makereal.tldraw.com/api/`:

**OpenAI** (api/openai/route.ts)
- Uses `@ai-sdk/openai` with `streamText`
- Special handling for gpt-5 via `openai.responses('gpt-5')`
- Fixed temperature: 0, seed: 42

**Anthropic** (api/anthropic/route.ts)
- Uses `@ai-sdk/anthropic` with streaming
- Supports standard Claude models and extended thinking models (suffixed with " (thinking)")

**Google** (api/google/route.ts)
- Uses `@ai-sdk/google` for Gemini models
- Supports latest Gemini 3 Pro and Gemini 2.5 Flash models

All routes:
- Accept `{ apiKey, messages, model, systemPrompt }` in POST body
- Stream responses as text (not JSON)
- Have `maxDuration: 60` seconds
- Use `force-dynamic` to prevent caching

### Message Construction

**getMessages** (app/lib/getMessages.ts)
- Builds the message array sent to AI providers
- Structure: user prompt → canvas image → text content → previous previews
- Includes theme preference (light/dark)
- For iterations, includes previous HTML + screenshot of previous result
- Uses multimodal format with text and image parts

### Environment Variables

The app expects API keys in environment variables, but users primarily configure them via the in-app Settings UI:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

Additional:
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` - Google Analytics tracking
- Vercel Blob/KV/Postgres credentials for link sharing

### tldraw Integration

- Custom shape: PreviewShape (registered in shapeUtils array)
- Custom components:
  - SharePanel → MakeRealButton
  - MainMenu → Adds Settings/Links
- Persistence key: "tldraw" (saves canvas state to browser storage)
- License key stored in app/constants.ts

### Important Files

- **app/lib/settings.tsx** - Settings atom, providers config, migration logic
- **app/prompt.ts** - All AI prompt templates
- **app/hooks/useMakeReal.ts** - Main feature implementation
- **app/lib/getMessages.ts** - Constructs messages for AI APIs
- **app/PreviewShape/PreviewShape.tsx** - Preview rendering and interaction
- **app/lib/htmlify.ts** - Extracts HTML from AI responses
- **app/lib/uploadLink.tsx** - Uploads to Vercel Blob for sharing

## Code Patterns

### Adding a New AI Provider

1. Add provider config to `PROVIDERS` array in app/lib/settings.tsx:
   ```typescript
   {
     id: 'provider-id',
     name: 'Provider Name',
     models: ['model-1', 'model-2'],
     prompt: NOVEMBER_19_2025,
     help: 'https://help-url',
     validate: (key: string) => key.startsWith('prefix-'),
   }
   ```

2. Create API route at app/makereal.tldraw.com/api/provider-id/route.ts:
   ```typescript
   import { createProvider } from '@ai-sdk/provider'
   import { streamText } from 'ai'

   export const maxDuration = 60
   export const dynamic = 'force-dynamic'

   export async function POST(req: Request) {
     const { apiKey, messages, model, systemPrompt } = await req.json()
     const provider = createProvider({ apiKey })

     const result = streamText({
       model: provider(model),
       system: systemPrompt,
       messages,
     })

     return result.toTextStreamResponse()
   }
   ```

3. Add switch case in useMakeReal.ts (search for `switch (provider)`)

### Modifying Prompts

Edit the prompt constants in app/prompt.ts. The current production prompt is `NOVEMBER_19_2025`. To update:

1. Create new prompt constant with descriptive name
2. Update references in app/lib/settings.tsx (both default and migration)
3. Increment `MIGRATION_VERSION` to trigger prompt update for existing users

### Settings Migrations

When changing settings schema:

1. Increment `MIGRATION_VERSION` in app/lib/settings.tsx
2. Add migration logic in `applySettingsMigrations` function:
   ```typescript
   if (version < NEW_VERSION) {
     // Apply migration
     settingsWithModelsProperty.someNewField = defaultValue
   }
   ```

## Common Tasks

### Testing Locally

1. Add API keys to `.env.local` (or configure via Settings UI in app)
2. Run `yarn dev`
3. Draw shapes on canvas
4. Select shapes and click "Make Real" button
5. Preview appears to the right of selection

### Debugging Generated HTML

- Preview shapes have a dropdown menu (three dots icon when selected)
- Options: Copy HTML, Copy URL, Open in new window
- Check browser console for AI response logs
- HTML is extracted via `htmlify()` function (looks for `<!DOCTYPE html>` to `</html>`)

### Adding New Models

Update the `models` array for the relevant provider in app/lib/settings.tsx. Users can then select the model from Settings dropdown.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Canvas**: tldraw 4.x
- **AI SDKs**: Vercel AI SDK with provider adapters
- **Styling**: Tailwind CSS
- **State**: tldraw atoms for settings
- **Storage**: Vercel Blob (link uploads), localStorage (settings/canvas)
- **Analytics**: Vercel Analytics + custom tldraw analytics

## Notes

- The app operates entirely client-side except for API route proxying
- API keys are stored in browser localStorage (users must provide their own)
- Preview shapes use nested iframes for isolation and export
- Streaming is implemented via TextDecoder and manual HTML parsing (looks for `<!DOCTYPE html>` start tag)
- Settings use versioned localStorage keys (`makereal_settings_2`, `makereal_version`) for migrations
