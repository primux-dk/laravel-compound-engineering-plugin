# Changelog

All notable changes to the compound-engineering plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-01-20

### Added

- `laravel-livewire-patterns` skill - Comprehensive patterns for Livewire v3, Form Objects, and Flux UI
  - Component structure, lifecycle, attributes (#[Title], #[Lazy], #[On], etc.)
  - Form Objects for validation and data handling
  - Flux UI Pro components (forms, tables, modals, navigation)
  - Real-time features (live search, polling, events)
  - Reference files: `components.md`, `form-objects.md`, `flux-ui.md`

- `laravel-database-patterns` skill - Database operations, migrations, transactions, and Eloquent optimization
  - Migration patterns with naming conventions and column types
  - Transaction handling (closure, manual, retries, savepoints, locking)
  - Eloquent best practices (scopes, accessors, events, relationships)
  - Query optimization (eager loading, N+1 prevention, chunking)
  - Reference files: `migrations.md`, `transactions.md`, `eloquent.md`

### Changed

- `/workflows:plan` - Add interactive refinement for better planning
  - **Idea Refinement**: Before research, ask clarifying questions using AskUserQuestion
  - **Research Validation**: After research, summarize findings and validate alignment
  - Skip option when description is already detailed
  - Inspired by [PR #88](https://github.com/EveryInc/compound-engineering-plugin/pull/88)

- `/workflows:work` - Merge improvements from upstream [PR #93](https://github.com/EveryInc/compound-engineering-plugin/pull/93)
  - **Branch Detection**: Smart detection of current branch and repository default (main/master)
  - **Contextual Setup**: Different guidance based on whether you're on a feature branch or default branch
  - **Safety Guard**: Never commit directly to default branch without explicit user permission
  - **Incremental Commits**: New section with decision matrix for when to commit
  - Renumbered Phase 2 steps to accommodate new section

- Enhanced `taylor-otwell-style` skill
  - Stronger emphasis on Actions pattern and thin controllers
  - Added i18n/translation patterns reference (`i18n.md`)
  - Updated routing to include i18n as option 8

- Updated agents to use Laravel skills
  - `taylor-otwell-reviewer` now includes: `taylor-otwell-style`, `laravel-livewire-patterns`, `laravel-database-patterns`
  - `data-integrity-guardian` now includes: `laravel-database-patterns`
  - `data-migration-expert` now includes: `laravel-database-patterns`

### Summary

- 24 agents, 24 commands, 15 skills, 1 MCP server

---

## [1.2.0] - 2026-01-18

### Added

- `web-interface-review` skill - Review web UI code against Vercel's Web Interface Guidelines
  - Checks accessibility, focus states, forms, animations, typography
  - Validates performance patterns, navigation, touch interactions, i18n
  - Outputs findings in VS Code-compatible `file:line` format
  - Full reference documentation in `references/guidelines.md`

### Summary

- 24 agents, 20 commands, 13 skills, 1 MCP server

---

## [1.1.0] - 2026-01-18

### Added

- `/plugin:doctor` command - Check plugin requirements and install missing dependencies
  - Checks core requirements: PHP, Composer, Node.js, npm, Python, pip
  - Checks Context7 MCP server configuration
  - Checks skill-specific tools: agent-browser, rclone, GEMINI_API_KEY, google-genai, pillow
  - Checks Laravel project tools: Pint, PEST, PHPStan
  - Offers to configure Context7 MCP and install missing dependencies interactively

### Summary

- 24 agents, 20 commands, 12 skills, 1 MCP server

---

## [1.0.0] - 2026-01-18

### Changed

This release converts the plugin from Ruby/Rails to Laravel/PHP.

**Skills:**
- Replaced `dhh-rails-style` with `taylor-otwell-style` - Laravel/PHP coding conventions based on Taylor Otwell's philosophy
- Replaced `andrew-kane-gem-writer` with `spatie-laravel-package-writer` - Laravel package development following Spatie patterns

**Agents:**
- Replaced `dhh-rails-reviewer` with `taylor-otwell-reviewer` - Laravel code review from Taylor Otwell's perspective
- Updated `lint` agent - Now uses Laravel Pint, PHPStan, and composer audit (only lints changed files)
- Updated `framework-docs-researcher` - Uses composer instead of bundler
- Updated `performance-oracle` - Eloquent optimization, queue jobs
- Updated `security-sentinel` - Laravel request validation, fillable/guarded, @csrf
- Updated `data-migration-expert` - Artisan commands instead of rake tasks
- Updated `deployment-verification-agent` - Artisan migrate, Eloquent/Tinker examples
- Updated `bug-reproduction-validator` - Laravel app references

**Commands:**
- Updated `review.md` - Removed rails-turbo-expert, uses taylor-otwell-reviewer
- Updated `deepen-plan.md` - Simplified skill references (no paths needed)
- Updated `compound.md`, `work.md`, `plan_review.md` - Laravel reviewer references

### Removed

- `kieran-rails-reviewer` agent - taylor-otwell-reviewer covers Laravel
- `ankane-readme-writer` agent - spatie-laravel-package-writer covers Laravel packages
- `dhh-rails-style` skill directory
- `rails-turbo-expert` reference

### Summary

- 24 agents, 23 commands, 12 skills, 1 MCP server

---

## Attribution

This plugin is forked from the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by Every Inc, created by Kieran Klaassen. The Laravel adaptations build upon their pioneering work in AI-powered development workflows.
