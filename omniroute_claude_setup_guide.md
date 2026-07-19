# OmniRoute Integration & Local Dev Environment Setup Guide

## 1. OmniRoute AI Gateway Setup
OmniRoute routes LLM calls across 90+ free AI models, fallbacks, and local models.

- **Base URL**: `http://localhost:3000/v1` (or your deployed OmniRoute instance URL)
- **Environment Variable**: `OMNIROUTE_URL="http://localhost:3000/v1"`
- **AI Gateway Service**: `apps/api/src/modules/ai-gateway/ai-gateway.service.ts`

---

## 2. Using Claude Code with OmniRoute Base URL

To route Claude CLI commands through OmniRoute (or any custom OpenAI-compatible API gateway):

### Method A: Set Environment Variables for Custom Endpoint
In your terminal (PowerShell or Bash), export the custom base URL before launching Claude:

```bash
# PowerShell
$env:ANTHROPIC_BASE_URL="http://localhost:3000/v1"
$env:OPENAI_BASE_URL="http://localhost:3000/v1"
claude
```

```bash
# Bash / WSL
export ANTHROPIC_BASE_URL="http://localhost:3000/v1"
export OPENAI_BASE_URL="http://localhost:3000/v1"
claude
```

### Method B: Specify Custom Settings JSON
Pass a custom settings JSON file when invoking Claude CLI:

```bash
claude --settings '{"apiBaseUrl": "http://localhost:3000/v1"}'
```

---

## 3. Launching Claude Code directly in Terminal

To start a new Claude CLI session with auto-permissions in your terminal:

```bash
claude --permission-mode auto
```

Or to run non-interactively for automated prompt tasks:

```bash
claude -p "Implement modern animations on index.html"
```
