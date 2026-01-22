---
name: brainstorming
description: This skill should be used when exploring requirements and approaches through collaborative dialogue. It provides questioning techniques, YAGNI principles, and structured patterns for clarifying WHAT to build before planning HOW.
---

# Brainstorming Skill

Techniques for collaborative discovery and requirements clarification.

## When to Use

- Requirements are vague or incomplete
- Multiple valid approaches exist
- Trade-offs need exploration
- Stakeholder alignment needed
- New domain or unfamiliar territory

## When to Skip

- Requirements are explicit and detailed
- Clear acceptance criteria provided
- Following established patterns exactly
- Simple bug fixes with reproduction steps

## Questioning Techniques

### The Five Whys

Dig deeper to find root causes:

1. "Why is this needed?" → Surface answer
2. "Why does that matter?" → Business impact
3. "Why now?" → Urgency/priority
4. "Why this approach?" → Alternatives considered
5. "Why not simpler?" → Complexity check

### Problem Framing Questions

- What problem does this solve?
- Who experiences this problem?
- How often does it occur?
- What's the cost of not solving it?
- What does success look like?

### Scope Questions

- What's the minimum viable solution?
- What's explicitly out of scope?
- What can we defer to later?
- What are the hard constraints?
- What's negotiable?

### Approach Questions

- What approaches have been considered?
- What are the trade-offs of each?
- What's the simplest thing that could work?
- What similar problems have we solved?
- What patterns exist in the codebase?

## YAGNI Principles

**You Aren't Gonna Need It** - resist premature complexity.

### Apply YAGNI By

1. **Solve today's problem** - Don't design for hypothetical futures
2. **Choose simplest approach** - That solves the stated problem
3. **Defer decisions** - Until you have more information
4. **Avoid abstractions** - Until you see the pattern repeat 3+ times
5. **Question "what if"** - Most "what ifs" never happen

### Red Flags

Watch for complexity creep:

- "We might need this later"
- "What if the requirements change?"
- "Let's make it configurable"
- "This could be reused elsewhere"
- "Let's add a layer of abstraction"

### Counter-Questions

- "Do we need this for the current requirement?"
- "What's the cost of adding this later vs now?"
- "How likely is this scenario?"
- "Can we solve this more simply?"

## Approach Exploration Pattern

Present 2-3 concrete options:

```markdown
### Option A: [Name] (Recommended)

[2-3 sentence description]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]

**Best when:** [Ideal conditions]

**Complexity:** Low / Medium / High
```

### Guidelines

- Lead with simplest viable option
- Include "do nothing" if viable
- Be concrete, not abstract
- Quantify when possible (time, effort, risk)
- Make recommendation clear

## Incremental Validation

Pause after each section to confirm alignment:

- "Does this capture the problem correctly?"
- "Is anything missing from the scope?"
- "Does this approach make sense?"
- "Should we explore other options?"

Don't assume - validate explicitly.

## Output Structure

Brainstorm documents follow this structure:

```markdown
# [Topic]

**Date:** YYYY-MM-DD
**Status:** Ready for planning | Needs refinement | On hold

## What We're Building
[Summary]

## Problem & Context
[Why this matters]

## Chosen Approach
[Selected solution and rationale]

## Key Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|

## Trade-offs Accepted
- [Trade-off]: [Gain vs loss]

## Out of Scope
- [Excluded items]

## Open Questions
- [ ] [Remaining uncertainties]
```

**Output Location:** `docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md`

## Integration with Planning

Brainstorming answers **WHAT** → Planning answers **HOW**

| Brainstorm Output | Planning Input |
|-------------------|----------------|
| Problem statement | Context section |
| Chosen approach | Technical approach |
| Key decisions | Constraints |
| Out of scope | Non-goals |
| Open questions | Risks to address |

When `/workflows:plan` receives a brainstorm file, it skips redundant discovery and proceeds to implementation planning.
