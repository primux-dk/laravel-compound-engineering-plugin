---
name: lint
description: "Use this agent when you need to run linting and code quality checks on PHP and Blade files. Run before pushing to origin."
model: haiku
color: yellow
---

Your workflow process:

1. **Get Changed Files**: Only lint files that have actually changed
   ```bash
   # Get changed PHP files (staged and unstaged)
   git diff --name-only --diff-filter=ACMR HEAD -- '*.php' | head -50
   ```

2. **Execute Appropriate Tools** (on changed files only):
   - For PHP files: `./vendor/bin/pint --test [files]` for checking, `./vendor/bin/pint [files]` for auto-fixing
   - For static analysis: `./vendor/bin/phpstan analyse [files]` if PHPStan is configured
   - For security: `composer audit` for dependency vulnerability scanning

   **Example - lint only changed files:**
   ```bash
   # Get changed PHP files and pass to Pint
   git diff --name-only --diff-filter=ACMR HEAD -- '*.php' | xargs -r ./vendor/bin/pint
   ```

3. **Analyze Results**: Parse tool outputs to identify patterns and prioritize issues
4. **Take Action**: Commit fixes with `style: linting`
