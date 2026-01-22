---
name: workflows:brainstorm
description: Explore requirements and approaches through collaborative dialogue before planning implementation
argument-hint: "[feature idea or problem to explore]"
---

# Brainstorm Command

Explore WHAT to build before planning HOW to build it.

## Introduction

This command facilitates collaborative discovery through dialogue. Use it when requirements are unclear, multiple approaches exist, or you need to think through a problem before committing to a plan.

**Brainstorm → Plan → Work**

| Phase | Question | Output |
|-------|----------|--------|
| Brainstorm | WHAT to build? | `docs/brainstorms/*.md` |
| Plan | HOW to build it? | `docs/plans/*.md` |
| Work | Execute | Code + PR |

## Process Knowledge

Load the `brainstorming` skill for detailed questioning techniques, YAGNI principles, and approach exploration patterns.

## Input

<idea> #$ARGUMENTS </idea>

**If empty, ask:** "What would you like to explore? Describe the feature, problem, or idea you're thinking about."

## Phase 0: Assess Clarity

Before diving in, quickly assess if brainstorming is needed:

**Skip brainstorming if the idea already has:**
- [ ] Clear acceptance criteria
- [ ] Referenced existing patterns to follow
- [ ] Well-defined scope (what's in/out)
- [ ] Obvious implementation approach

If all boxes could be checked, offer: "This seems well-defined. Skip brainstorming and go straight to `/workflows:plan`?"

## Phase 1: Understand the Idea

### Quick Context Scan

Light repository exploration (not deep research):
- Check CLAUDE.md for relevant conventions
- Scan for obviously similar features
- Note any mentioned constraints

### Collaborative Dialogue

Use **AskUserQuestion tool** to clarify requirements one question at a time:

**Core Questions:**
- What problem does this solve? Who experiences it?
- What does success look like? How will we know it works?
- What's the scope? What's explicitly NOT included?
- Are there constraints? (timeline, tech, dependencies)
- What have you already tried or considered?

**Questioning Principles:**
- One question at a time
- Prefer multiple choice when options are clear
- Probe deeper when answers reveal complexity
- Stop when requirements are clear enough to propose approaches

## Phase 2: Explore Approaches

Propose 2-3 concrete approaches:

```markdown
### Approach A: [Name] (Recommended)

[2-3 sentence description]

**Pros:** [key advantages]
**Cons:** [key disadvantages]
**Best when:** [ideal conditions]

### Approach B: [Name]

[2-3 sentence description]

**Pros:** [key advantages]
**Cons:** [key disadvantages]
**Best when:** [ideal conditions]
```

**Guidelines:**
- Lead with simplest viable approach
- Apply YAGNI - avoid over-engineering
- Be concrete, not abstract
- Include "do nothing" or "manual workaround" if viable

Use **AskUserQuestion** to let user select or refine approaches.

## Phase 3: Capture the Design

Document decisions in `docs/brainstorms/`:

**Filename:** `docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md`
- Use today's date
- Topic in kebab-case (3-5 words)
- Add `-brainstorm` suffix for self-documenting filenames
- Example: `docs/brainstorms/2026-01-21-user-notification-preferences-brainstorm.md`

**Template:**

```markdown
# [Topic Title]

**Date:** YYYY-MM-DD
**Status:** Ready for planning | Needs refinement | On hold

## What We're Building

[1-2 paragraph summary of the feature/solution]

## Problem & Context

[What problem this solves, who it affects, why it matters now]

## Chosen Approach

[The selected approach and why it was chosen over alternatives]

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision point] | [What we chose] | [Why] |

## Trade-offs Accepted

- [Trade-off]: [What we gain vs give up]

## Out of Scope

- [Explicitly excluded items]

## Open Questions

- [ ] [Any remaining uncertainties to resolve during planning]

## Alternatives Considered

### [Alternative A]
[Brief description and why not chosen]

### [Alternative B]
[Brief description and why not chosen]
```

## Phase 4: Handoff

After saving the brainstorm, use **AskUserQuestion**:

**Question:** "Brainstorm saved to `docs/brainstorms/<filename>-brainstorm.md`. What's next?"

**Options:**
1. **Start planning** - Run `/workflows:plan` with this context
2. **Refine further** - Continue exploring
3. **Pause for now** - Save and revisit later

If "Start planning":
```
/workflows:plan docs/brainstorms/<filename>.md
```

The plan command will detect the brainstorm file and skip redundant discovery.

## Key Principles

1. **WHAT before HOW** - Requirements before implementation
2. **One question at a time** - Don't overwhelm
3. **YAGNI** - Simplest solution that could work
4. **Brevity** - Short docs that capture essence
5. **No code** - This is about requirements, not implementation

## When to Use

- Unclear or evolving requirements
- Multiple valid approaches to evaluate
- Need stakeholder alignment before planning
- Complex problem needing decomposition
- New domain or unfamiliar territory

## When to Skip

- Bug fixes with clear reproduction steps
- Small, well-defined enhancements
- Following established patterns exactly
- User provided detailed requirements

Go directly to `/workflows:plan` instead.
