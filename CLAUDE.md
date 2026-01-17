# Laravel Compound Engineering Plugin

This repository is a Claude Code plugin marketplace that distributes the `compound-engineering` plugin to developers building with AI-powered tools.

## Repository Structure

```
laravel-compound-engineering-plugin/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace catalog (lists available plugins)
└── plugins/
    └── compound-engineering/     # The actual plugin
        ├── .claude-plugin/
        │   └── plugin.json       # Plugin metadata
        ├── agents/               # Specialized AI agents
        ├── commands/             # Slash commands
        ├── skills/               # Skills
        ├── README.md             # Plugin documentation
        └── CHANGELOG.md          # Version history
```

## Philosophy: Compounding Engineering

**Each unit of engineering work should make subsequent units of work easier—not harder.**

When working on this repository, follow the compounding engineering process:

1. **Plan** → Understand the change needed and its impact
2. **Delegate** → Use AI tools to help with implementation
3. **Assess** → Verify changes work as expected
4. **Codify** → Update this CLAUDE.md with learnings

## Claude Code Extension Architecture (v2.1.3+)

> **Important:** As of Claude Code 2.1.3, commands and skills have been unified into a single system.

### The Three Extension Types

| Type | Purpose | Invocation | Context |
|------|---------|------------|---------|
| **Skills** | Reusable knowledge & prompts | `/skill` or auto-discovered | Same conversation |
| **Agents** | Isolated specialized workers | `@agent` or auto-delegated | Separate context |
| **Hooks** | Deterministic enforcement | Automatic on events | N/A |

### Skills: The Unified Approach

Commands and skills are now the same mechanism. The Skill tool handles both user-invoked (`/command`) and model-invoked (auto-discovered) capabilities.

**Structure options:**

```
# Simple skill (single file)
skills/commit.md

# Complex skill (directory with supporting files)
skills/livewire/
├── SKILL.md
├── PATTERNS.md
└── scripts/
```

**Frontmatter controls:**

```yaml
---
name: my-skill
description: What it does and when to use it

# Visibility Controls
user-invocable: true              # Show in / menu (default: true)
disable-model-invocation: false   # Prevent auto-discovery (default: false)

# Tool Restrictions
allowed-tools: Read, Grep, Glob   # Limit available tools (optional)

# Other Options
model: claude-3-5-haiku-20241022  # Override model (optional)
---
```

**Mapping old commands to new skills:**

| Desired Behavior | Frontmatter Configuration |
|------------------|---------------------------|
| Manual `/command` only | `disable-model-invocation: true` |
| Auto-discovered only | `user-invocable: false` |
| Both (hybrid) | Default - no flags needed |

### Agents vs Skills

| Aspect | Skills | Agents |
|--------|--------|--------|
| **Context** | Same conversation | Isolated context window |
| **Effect** | Injects knowledge | Delegates task, returns summary |
| **Tool access** | Inherits or restricts | Fully configurable |
| **Nesting** | Can chain | Cannot spawn other subagents |

**Use agents when you need:**
- Context isolation (exploration shouldn't pollute main conversation)
- Different tool permissions (read-only reviewer, restricted deployer)
- Cost control (route simple tasks to Haiku)
- Parallel/background execution

**Agent frontmatter:**

```yaml
---
name: code-reviewer
description: Review code for quality and security
tools: Read, Grep, Glob       # Allowed tools
model: haiku                  # Model override
skills: skill-1, skill-2     # Inject skills at startup
---
```

### Hooks: Deterministic Enforcement

Hooks are NOT part of the skill unification. They provide deterministic control where CLAUDE.md and skills are suggestions.

```
CLAUDE.md saying "don't edit .env" → Parsed by LLM → Maybe followed
PreToolUse hook blocking .env edits → Always runs → Operation blocked
```

**Hook events:** `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `Notification`

---

## Working with This Repository

### Adding a New Plugin

1. Create plugin directory: `plugins/new-plugin-name/`
2. Add plugin structure:
   ```
   plugins/new-plugin-name/
   ├── .claude-plugin/plugin.json
   ├── agents/
   ├── commands/
   └── README.md
   ```
3. Update `.claude-plugin/marketplace.json` to include the new plugin
4. Test locally before committing

### Updating the Compounding Engineering Plugin

When agents, commands, or skills are added/removed, follow this checklist:

#### 1. Count all components accurately

```bash
# Count agents
ls plugins/compound-engineering/agents/*.md | wc -l

# Count commands
ls plugins/compound-engineering/commands/*.md | wc -l

# Count skills
ls -d plugins/compound-engineering/skills/*/ 2>/dev/null | wc -l
```

#### 2. Update ALL description strings with correct counts

The description appears in multiple places and must match everywhere:

- [ ] `plugins/compound-engineering/.claude-plugin/plugin.json` → `description` field
- [ ] `.claude-plugin/marketplace.json` → plugin `description` field
- [ ] `plugins/compound-engineering/README.md` → intro paragraph

Format: `"Includes X specialized agents, Y commands, and Z skill(s)."`

#### 3. Update version numbers

When adding new functionality, bump the version in:

- [ ] `plugins/compound-engineering/.claude-plugin/plugin.json` → `version`
- [ ] `.claude-plugin/marketplace.json` → plugin `version`

#### 4. Update documentation

- [ ] `plugins/compound-engineering/README.md` → list all components
- [ ] `plugins/compound-engineering/CHANGELOG.md` → document changes
- [ ] `CLAUDE.md` → update structure diagram if needed

#### 5. Validate JSON files

```bash
cat .claude-plugin/marketplace.json | jq .
cat plugins/compound-engineering/.claude-plugin/plugin.json | jq .
```

#### 6. Verify before committing

```bash
# Ensure counts in descriptions match actual files
grep -o "Includes [0-9]* specialized agents" plugins/compound-engineering/.claude-plugin/plugin.json
ls plugins/compound-engineering/agents/*.md | wc -l
```

### Marketplace.json Structure

The marketplace.json follows the official Claude Code spec:

```json
{
  "name": "marketplace-identifier",
  "owner": {
    "name": "Owner Name",
    "url": "https://github.com/owner"
  },
  "metadata": {
    "description": "Marketplace description",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "description": "Plugin description",
      "version": "1.0.0",
      "author": { ... },
      "homepage": "https://...",
      "tags": ["tag1", "tag2"],
      "source": "./plugins/plugin-name"
    }
  ]
}
```

**Only include fields that are in the official spec.** Do not add custom fields like:

- `downloads`, `stars`, `rating` (display-only)
- `categories`, `featured_plugins`, `trending` (not in spec)
- `type`, `verified`, `featured` (not in spec)

### Plugin.json Structure

Each plugin has its own plugin.json with detailed metadata:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": { ... },
  "keywords": ["keyword1", "keyword2"],
  "components": {
    "agents": 15,
    "commands": 6,
    "hooks": 2
  },
  "agents": {
    "category": [
      {
        "name": "agent-name",
        "description": "Agent description",
        "use_cases": ["use-case-1", "use-case-2"]
      }
    ]
  },
  "commands": {
    "category": ["command1", "command2"]
  }
}
```

## Testing Changes

### Test Locally

1. Install the marketplace locally:

   ```bash
   claude /plugin marketplace add /Users/yourusername/laravel-compound-engineering-plugin
   ```

2. Install the plugin:

   ```bash
   claude /plugin install compound-engineering
   ```

3. Test agents and commands:
   ```bash
   claude /review
   claude agent kieran-rails-reviewer "test message"
   ```

### Validate JSON

Before committing, ensure JSON files are valid:

```bash
cat .claude-plugin/marketplace.json | jq .
cat plugins/compound-engineering/.claude-plugin/plugin.json | jq .
```

## Common Tasks

### Adding a New Agent

1. Create `plugins/compound-engineering/agents/new-agent.md`
2. Update plugin.json agent count and agent list
3. Update README.md agent list
4. Test with `claude agent new-agent "test"`

### Adding a New Command

> **Note:** As of Claude Code 2.1.3, commands and skills are unified. New "commands" should be created as skills with `disable-model-invocation: true` if they should only be manually invoked.

**Legacy approach (commands/ directory):**
1. Create `plugins/compound-engineering/commands/new-command.md`
2. Update plugin.json command count and command list
3. Update README.md command list
4. Test with `claude /new-command`

**Recommended approach (skills with manual-only flag):**
1. Create `plugins/compound-engineering/skills/new-command.md` (or `skills/new-command/SKILL.md` for complex commands)
2. Add frontmatter with `disable-model-invocation: true`
3. Update counts and documentation
4. Test with `claude /new-command`

### Adding a New Skill

1. Create skill directory: `plugins/compound-engineering/skills/skill-name/`
2. Add skill structure:
   ```
   skills/skill-name/
   ├── SKILL.md           # Skill definition with frontmatter (name, description)
   └── scripts/           # Supporting scripts (optional)
   ```
3. Update plugin.json description with new skill count
4. Update marketplace.json description with new skill count
5. Update README.md with skill documentation
6. Update CHANGELOG.md with the addition
7. Test with `claude skill skill-name`

**Skill file format (SKILL.md):**
```markdown
---
name: skill-name
description: Brief description of what the skill does

# Optional visibility controls (see Architecture section above)
user-invocable: true              # Show in / menu (default: true)
disable-model-invocation: false   # Prevent auto-discovery (default: false)
allowed-tools: Read, Grep, Glob   # Restrict available tools (optional)
---

# Skill Title

Detailed documentation...
```

### Updating Tags/Keywords

Tags should reflect the compounding engineering philosophy:

- Use: `ai-powered`, `compound-engineering`, `workflow-automation`, `knowledge-management`
- Avoid: Framework-specific tags unless the plugin is framework-specific

## Commit Conventions

Follow these patterns for commit messages:

- `Add [agent/command name]` - Adding new functionality
- `Remove [agent/command name]` - Removing functionality
- `Update [file] to [what changed]` - Updating existing files
- `Fix [issue]` - Bug fixes
- `Simplify [component] to [improvement]` - Refactoring

Include the Claude Code footer:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Resources to search for when needing more information

- [Claude Code Plugin Documentation](https://docs.claude.com/en/docs/claude-code/plugins)
- [Plugin Marketplace Documentation](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)
- [Plugin Reference](https://docs.claude.com/en/docs/claude-code/plugins-reference)

## Key Learnings

_This section captures important learnings as we work on this repository._

### 2024-11-22: Added gemini-imagegen skill and fixed component counts

Added the first skill to the plugin and discovered the component counts were wrong (said 15 agents, actually had 17). Created a comprehensive checklist for updating the plugin to prevent this in the future.

**Learning:** Always count actual files before updating descriptions. The counts appear in multiple places (plugin.json, marketplace.json, README.md) and must all match. Use the verification commands in the checklist above.

### 2026-01-17: Claude Code 2.1.3 unified commands and skills

Discovered that Claude Code 2.1.3 merged slash commands and skills into a single system. Key insights:

- **Commands and skills are now the same mechanism** - both handled by the Skill tool
- **Frontmatter controls visibility**: `user-invocable` (show in / menu) and `disable-model-invocation` (prevent auto-discovery)
- **Agents remain separate** - they provide isolated context, not same-conversation knowledge
- **Hooks remain separate** - they provide deterministic enforcement

The mental model:
- "Should this knowledge be reusable?" → **Skill**
- "Should this run in isolation?" → **Agent**
- "Must this ALWAYS happen?" → **Hook**

**Learning:** When creating new commands, prefer creating them as skills with `disable-model-invocation: true` for manual-only behavior. This aligns with the unified architecture and gives more control over visibility.

### 2024-11-22: Added gemini-imagegen skill and fixed component counts

Added the first skill to the plugin and discovered the component counts were wrong (said 15 agents, actually had 17). Created a comprehensive checklist for updating the plugin to prevent this in the future.

**Learning:** Always count actual files before updating descriptions. The counts appear in multiple places (plugin.json, marketplace.json, README.md) and must all match. Use the verification commands in the checklist above.

### 2024-10-09: Simplified marketplace.json to match official spec

The initial marketplace.json included many custom fields (downloads, stars, rating, categories, trending) that aren't part of the Claude Code specification. We simplified to only include:

- Required: `name`, `owner`, `plugins`
- Optional: `metadata` (with description and version)
- Plugin entries: `name`, `description`, `version`, `author`, `homepage`, `tags`, `source`

**Learning:** Stick to the official spec. Custom fields may confuse users or break compatibility with future versions.
