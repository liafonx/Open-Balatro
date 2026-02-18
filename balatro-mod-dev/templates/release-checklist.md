# Release Checklist: {{ModName}} v{{Version}}

## Pre-Flight

### Version
- [ ] Version bumped in `{{ModName}}.json`
- [ ] Version bumped in `manifest.json` (if Thunderstore)
- [ ] Version matches in both files

### Code Quality
- [ ] No bare `print()` calls (use Logger)
- [ ] No `TODO` or `FIXME` comments left unresolved
- [ ] All nil guards in place for G.GAME access
- [ ] No debug/test code left in

### Localization
- [ ] `localization/en-us.lua` has all keys
- [ ] Other language files updated (if applicable)
- [ ] No hardcoded English strings in Lua files

### Documentation
- [ ] README.md updated with new features/changes
- [ ] CHANGELOG.md updated with version entry
- [ ] README_zh.md updated (if maintained)
- [ ] CHANGELOG_zh.md updated (if maintained)

### Testing
- [ ] Test scenarios from AGENT.md verified
- [ ] No errors in Lovely logs related to this mod
- [ ] SMODS objects register correctly
- [ ] Mobile compatibility checked (if applicable)

### Assets
- [ ] All atlas images have correct dimensions
- [ ] No transparent pixel issues (run `/fix-sprites` if needed)
- [ ] icon.png present and correct size (256x256 for Thunderstore)

## Release

- [ ] Run `/release {{Version}}`
- [ ] Verify release packages in `release/{{Version}}/`
- [ ] Upload to GitHub releases
- [ ] Upload to Thunderstore (if applicable)
- [ ] Upload to NexusMods (if applicable)
