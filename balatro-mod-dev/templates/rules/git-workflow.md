# Git Workflow for Balatro Mods

## Branch Naming

- `main` — stable, released code
- `feat/<name>` — new features (e.g., `feat/custom-blind`)
- `fix/<name>` — bug fixes (e.g., `fix/nil-guard-scoring`)
- `refactor/<name>` — code cleanup without behavior change

## Commit Messages

Format: `<type>: <description>`

Types:
- `feat` — new mod feature (new joker, blind, consumable)
- `fix` — bug fix
- `refactor` — code restructuring
- `docs` — documentation only
- `chore` — config, scripts, non-code changes
- `asset` — sprite/image/atlas changes
- `locale` — localization additions or updates

Examples:
```
feat: add Crimson Heart joker with scaling mult
fix: guard nil G.GAME.blind access in timer reset
locale: add zh_CN translations for all jokers
asset: update joker atlas with new sprites
```

## Protected Files

Do not modify without confirmation:
- `AGENTS.md`, `mod.config.json`
- `README.md`, `README_zh.md`, `CHANGELOG.md`, `CHANGELOG_zh.md` (use `/update-docs` or `/bump-version`)

## PR Conventions (Fork Contributions)

When contributing to another mod:
1. Fork and create a feature branch
2. Keep changes minimal and focused
3. Use `/draft-pr` to generate PR description
4. Reference the issue being fixed (if any)
