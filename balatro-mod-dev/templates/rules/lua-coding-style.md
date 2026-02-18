---
paths: ["**/*.lua"]
---
# Lua Coding Style

## Nil Safety (CRITICAL)
- Always guard game state access: `if G.GAME and G.GAME.blind then`
- Never assume table keys exist: `local val = tbl and tbl.key`
- Use `or` for defaults: `local x = param or 0`

## Immutability
- Prefer creating new tables over mutating: `local new = {unpack(old)}; new[#new+1] = item`
- Never mutate function parameters

## Avoid Common Pitfalls (see plugin's references/lua-gotchas.md)
- Local variables in loops are re-scoped each iteration
- FFI cdata cannot be compared with `==` to Lua numbers — use `tonumber()` first
- `false` and `nil` are both falsy; `0` and `""` are truthy
- String concatenation with nil crashes — always `tostring()` first

## Performance
- Avoid per-frame table allocation (pre-allocate, reuse)
- Use `local` for frequently accessed globals: `local G = G`
- Minimize string concatenation in hot paths (use table.concat)

## Logging
- Own repos: `local log = require("Utils.Logger").create("Module")`
- Fork repos: `pcall(print, "[Debug] ...")` — remove before PR
- NEVER use bare `print()` in own repos
