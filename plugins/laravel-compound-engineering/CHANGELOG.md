# Changelog

All notable changes to the compound-engineering plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
