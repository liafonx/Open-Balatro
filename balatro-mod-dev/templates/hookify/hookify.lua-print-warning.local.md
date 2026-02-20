---
name: lua-print-warning
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.lua$
  - field: new_text
    operator: regex_match
    pattern: \bprint\s*\(
---

**Bare `print()` detected in Lua file.**

- **Own repos:** Use Logger instead: `local log = Logger.create("Module"); log("info", "msg")`
- **Forks:** Use `pcall(print, "[Debug] ...")` and remove before PR.

See `references/lua-gotchas.md` for details.
