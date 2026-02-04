# Lovely Patch Patterns

Lovely is the injection framework for Balatro mods. These patterns are extracted from working mods.

## Manifest Section

Every lovely.toml should start with a manifest:

```toml
[manifest]
version = "1.0.0"
priority = 0      # Higher = loads later (default: 0)
dump_lua = true   # Optional: dumps patched files for debugging
```

## Variable Substitution

Define variables that can be used across patches:

```toml
[vars]
mod_version = "1.2.3"
mod_prefix = "mymod"

[[patches]]
[patches.pattern]
target = "main.lua"
pattern = "-- MOD INIT"
position = "after"
payload = '''
print("{{lovely:mod_prefix}} loaded v{{lovely:mod_version}}")
'''
```

This transforms `{{lovely:mod_prefix}}` → `mymod` and `{{lovely:mod_version}}` → `1.2.3`.

## Patch Types

### 1. Pattern Patch (Exact Text Match)

Use when you need to match a specific line exactly. Supports wildcards:
- `*` - matches 0 or more characters
- `?` - matches exactly one character

```toml
[[patches]]
[patches.pattern]
target = "game.lua"
pattern = "function Game:start_run(args)"
position = "after"
payload = '''
-- Your injected code here
MY_MOD.on_start_run(args)
'''
match_indent = true  # Preserves indentation
times = 1            # Optional: only replace first N matches (default: all)
```

**Positions:**
- `before` - Insert before the matched line
- `after` - Insert after the matched line
- `at` - Replace the matched line entirely

### 2. Regex Patch (Complex Patterns)

Use when you need flexible matching with capture groups.

```toml
[[patches]]
[patches.regex]
target = "functions/misc_functions.lua"
pattern = "(G\\.ARGS\\.save_run = G\\.culled_table)"
position = "after"
line_prepend = '$indent'  # Prepend captured $indent group to each line
payload = '''
REWINDER.defer_save_creation()
'''
times = 1
```

**Regex with named capture groups (from Steamodded):**
```toml
[[patches]]
[patches.regex]
target = "tag.lua"
pattern = "(?<indent>[\t ]*)if (?<cond>_context.type == 'eval' then)"
position = 'at'
line_prepend = '$indent'
payload = '''
local obj = SMODS.Tags[self.key]
if obj and obj.apply then
    local res = obj.apply(self, _context)
    if res then return res end
elseif $cond
'''
times = 1
```

**IMPORTANT: Escaping Rules**
Lovely regex patterns are TOML strings, so there are *two* layers of escaping:
1. TOML string escaping (what you type in `lovely.toml`)
2. Regex escaping (what the regex engine actually sees)

**TOML vs regex examples**
- Literal `.` (dot), which is special in regex:
  - TOML: `pattern = "G\\.ARGS\\.save_run"`
  - Regex engine sees: `G\.ARGS\.save_run`
- Literal `(` (parenthesis), which starts a capture group in regex:
  - TOML: `pattern = "\\(hello\\) world"`
  - Regex engine sees: `\(hello\) world`

**Rules to remember**
- In TOML **basic strings** (double quotes), backslash `\` starts an escape.
- To send a single backslash to the regex engine, you must write **`\\`** in TOML.
- So to match a literal `(` in regex, the engine needs `\(` → in TOML you write **`"\\("`**.
- To match a literal `.` in regex, the engine needs `\.` → in TOML you write **`"\\."`**.
- Common mistake: `\\(\\)` in the **regex engine** means “backslash + parentheses”.
  - If you write `pattern = "\\\\(\\\\)"` in TOML, the engine sees `\\(\\)` (two literal backslashes and parentheses), **not** just `()` or `\(`.
### 3. Module Injection

Load a Lua file as a require-able module.

```toml
[[patches]]
[patches.module]
source = "Utils/NaNProtection.lua"
before = "globals.lua"  # Inject before this file loads
name = "NaNProtection"  # Module name for require()
```

**Accessing Modules:**
```lua
-- In your code
local NaNProtection = require("NaNProtection")  -- NOT a global!
```

**Note:** Currently only supports single-file modules.

### 4. Copy Patch (Append/Prepend)

Append or prepend entire files to a target.

```toml
[[patches]]
[patches.copy]
target = "main.lua"
position = "append"
sources = [
    "src/core.lua",
    "src/utils.lua",
]
payload = "-- Extra inline code if needed"
```

**Single file:**
```toml
[[patches]]
[patches.copy]
target = "functions/button_callbacks.lua"
source = "UI/ButtonCallbacks.lua"
position = "append"
```

## Common Patterns

### Hook a Function (After)

```toml
[[patches]]
[patches.pattern]
target = "game.lua"
pattern = "function Game:update(dt)"
position = "after"
payload = '''
    if MY_MOD and MY_MOD.on_update then
        MY_MOD.on_update(self, dt)
    end
'''
match_indent = true
```

### Inject Before Return

```toml
[[patches]]
[patches.regex]
target = "functions/misc_functions.lua"
pattern = "(return G\\.culled_table)"
position = "before"
payload = '''
    MY_MOD.before_return()
'''
```

### Replace a Value

```toml
[[patches]]
[patches.pattern]
target = "globals.lua"
pattern = "G.MAX_JOKERS = 5"
position = "at"
payload = "G.MAX_JOKERS = 10"
```

### Desktop vs Mobile Pattern Differences

Desktop pattern:
```lua
{n=G.UIT.T, config={ref_table = self.config, ref_value = 'card_limit', scale = 0.3, colour = G.C.WHITE}}
```

Mobile pattern (has `lang` parameter):
```lua
{n=G.UIT.T, config={ref_table = self.config, ref_value = 'card_limit', scale = 0.3, lang = G.LANGUAGES['en-us'], colour = G.C.WHITE}}
```

**Handle both:**
```toml
# Desktop patch
[[patches]]
[patches.pattern]
target = "cardarea.lua"
pattern = "{n=G.UIT.T, config={ref_table = self.config, ref_value = 'card_limit'"
position = "at"
payload = "{n=G.UIT.T, config={ref_table = SMODS and self.config.card_limits or self.config, ref_value = SMODS and 'total_slots' or 'card_limit'"

# Mobile patch (separate entry)
[[patches]]
[patches.pattern]
target = "cardarea.lua"
pattern = "{n=G.UIT.T, config={ref_table = self.config, ref_value = 'card_limit', scale = 0.3, lang = G.LANGUAGES['en-us']"
position = "at"
payload = "{n=G.UIT.T, config={ref_table = SMODS and self.config.card_limits or self.config, ref_value = SMODS and 'total_slots' or 'card_limit', scale = 0.3, lang = G.LANGUAGES['en-us']"
```

## Debugging Lovely Patches

### Verify Pattern Matches

Add checkpoint prints:
```toml
[[patches]]
[patches.pattern]
target = "game.lua"
pattern = "function Game:start_run"
position = "after"
payload = '''
pcall(print, "[MyMod] start_run hook active")
'''
```

### Check Lovely Logs

Location: `~/Library/Application Support/Balatro/Mods/lovely/log/`

### Dump Patched Output

```toml
[[patches]]
[patches.pattern]
target = "game.lua"
pattern = "..."
dump_lua = true  # Outputs patched file for inspection
```

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| `match_indent = true` in regex | Not supported | Remove from regex patches |
| `\\(` in pattern | Matches literal backslash | Use `\(` |
| Global module access | Modules aren't globals | Use `require("ModuleName")` |
| Pattern doesn't match | Whitespace/encoding differs | Check with `dump_lua = true` |
| Hook never runs | Pattern failed silently | Add pcall print to verify |
