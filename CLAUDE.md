# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Superpowers** is a skills library and workflow system for AI coding assistants. It provides disciplined development patterns through composable skills that enforce best practices like TDD, systematic debugging, and collaborative workflows.

**Key principle:** This is a documentation/plugin repository with no traditional build system. Skills are markdown files with YAML frontmatter, discovered dynamically by the platforms.

## Development Commands

### Testing

```bash
# Fast skill loading tests (~2 minutes)
./tests/claude-code/run-skill-tests.sh

# Integration tests (10-30 minutes) - run real workflows with subagents
./tests/claude-code/run-skill-tests.sh --integration

# Specific integration test
./tests/claude-code/run-skill-tests.sh --test test-subagent-driven-development.sh
```

**Important:** Integration tests MUST run from the superpowers plugin directory, not temp directories.

### Token Analysis

```bash
# Analyze token usage from a Claude Code session
python3 tests/claude-code/analyze-token-usage.py ~/.claude/projects/<project-dir>/<session-id>.jsonl
```

## Architecture

### Skill-Based System

Skills are stored as `SKILL.md` files with YAML frontmatter:
```yaml
---
name: skill-name
description: Use when [condition] - [purpose]
---
```

**Core discovery logic** in `lib/skills-core.js`:
- Recursively finds `SKILL.md` files (max depth 3)
- Handles skill shadowing (personal skills override superpowers)
- Strips frontmatter for content delivery

### Multi-Platform Integration

| Platform | Integration Method | Skill Discovery |
|----------|-------------------|-----------------|
| Claude Code | Plugin marketplace | Session hooks + native Skill tool |
| Codex | Symlink to `~/.agents/skills/` | Native filesystem scan |
| OpenCode | Plugin system | Symlink-based |

### Skill Categories

1. **Process Skills** - Guide HOW to approach tasks (`brainstorming`, `systematic-debugging`, `writing-plans`)
2. **Implementation Skills** - Execution frameworks (`subagent-driven-development`, `test-driven-development`)
3. **Quality Skills** - Review and verification (`requesting-code-review`, `verification-before-completion`)
4. **Meta Skills** - `using-superpowers` (enforces skill discipline), `writing-skills` (skill creation)

### The Discipline System

The `using-superpowers` skill enforces that **ALL skills are checked before ANY action**. This creates a mandatory workflow:
- User request → Skill check → Applicable skill → Process planning → Implementation
- Skills are invoked via the `Skill` tool, never read directly

## Skill Creation Workflow

**Skills are created via TDD:**
1. Run pressure scenario WITHOUT skill → document violations (baseline)
2. Write skill addressing those specific violations
3. Re-run scenario WITH skill → verify compliance
4. Find loopholes → plug → re-verify (refactor cycle)

See `skills/writing-skills/SKILL.md` for complete methodology.

## Key Files

| File | Purpose |
|------|---------|
| `lib/skills-core.js` | Skill discovery, frontmatter parsing, path resolution |
| `hooks/session-start.sh` | Auto-injects skills at session start |
| `tests/claude-code/run-skill-tests.sh` | Test runner |
| `tests/claude-code/test-helpers.sh` | Shared test utilities |
| `.claude-plugin/plugin.json` | Plugin metadata (version 4.2.0) |

## Important Constraints

- **Line endings:** Scripts require LF (enforced by `.gitattributes`)
- **Frontmatter:** Only `name` and `description` fields supported, max 1024 chars
- **Skill names:** Letters, numbers, hyphens only (no parentheses or special chars)
- **Testing:** Integration tests run actual Claude Code sessions in headless mode

## Session Context Injection

The hook system injects recent context at session start via `claude-mem` MCP tools, providing:
- Recent work history with semantic index
- Implementation details and rationale
- Debugging context across sessions

Context is stored as observations with tokens costs tracked for optimization.

## Common Patterns

### Subagent Per Task
Each implementation task gets a fresh subagent with:
- Full task description in prompt (no file reading required)
- Two-stage review (spec compliance, then code quality)
- Independent verification (reviewer reads code directly)

### Worktree Isolation
Development branches require git worktrees to prevent accidental main branch work. The `using-git-worktrees` skill enforces this.

### Test-Driven Development
Strict RED-GREEN-REFACTOR:
- RED: Write failing test, watch it fail
- GREEN: Write minimal code, watch it pass
- REFACTOR: Improve while tests pass
- Code written before tests is deleted
