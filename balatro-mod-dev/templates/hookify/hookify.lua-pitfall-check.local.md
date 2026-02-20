---
name: lua-pitfall-check
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.lua$
  - field: new_text
    operator: regex_match
    pattern: G\.GAME\.\w+|\.\..*\w+|cdata.*==\s*\d
---

**Lua pitfall pattern detected.** Check for these common issues:

- **G.GAME access without nil guard** — use: `if G.GAME and G.GAME.field then`
- **String concatenation with potential nil** — use `tostring()` for safety
- **FFI cdata comparison with number** — use `tonumber()` first

See `references/lua-gotchas.md` for details.
