# Lua & Balatro Mod Gotchas

Common pitfalls encountered across multiple Balatro mods. Check here when debugging unexpected behavior.

## Lua Language Gotchas

### 1. LuaJIT FFI cdata is NOT a table

When big-number mods (Talisman, Amulet) are active, numeric values become FFI structs (`cdata`), not plain numbers or tables.

```lua
-- WRONG - silently fails when Talisman is active
if type(value) == "number" then ... end
if type(value) == "table" then ... end

-- CORRECT - check for cdata too
if type(value) == "number" or type(value) == "cdata" then ... end
```

**Why:** `type(cdata)` returns `"cdata"`, not `"number"` or `"table"`. `tonumber(struct_cdata)` returns `nil`. Code that only checks for `number`/`table` silently skips cdata values.

**When it matters:** Any mod that inspects or manipulates chip counts, multipliers, money, or any numeric game value that Talisman might make arbitrarily large.

### 2. Local function scoping — silent nil

Calling a `local function` before its definition silently resolves to `nil` (no error).

```lua
-- WRONG - bar() is nil when foo() calls it
local function foo()
    bar()  -- nil, not an error!
end

local function bar()
    -- ...
end

-- CORRECT - forward declaration
local bar  -- declare first

local function foo()
    bar()  -- works
end

bar = function()
    -- ...
end
```

**When it matters:** Large single-file mods with cross-referencing helper functions. Especially dangerous because Lua won't error — the call just silently does nothing.

### 3. Boolean normalization — 0 is truthy, nil is not false

Lua treats `0`, `""`, and `"0"` as truthy. Only `nil` and `false` are falsy.

```lua
-- WRONG - "0" from a parsed config/meta file is truthy
local enabled = meta.some_flag  -- "0" → truthy!
if enabled then ... end          -- runs unexpectedly

-- CORRECT - normalize at read boundary
local enabled = (meta.some_flag == "1" or meta.some_flag == true)
```

**Also:** Distinguish `nil` (not loaded yet) from `false` (explicitly disabled) in cache fields. Add hydration logic before evaluating lazy-loaded optional fields:

```lua
-- WRONG
if not self.cached_value then self:load() end  -- false triggers reload

-- CORRECT
if self.cached_value == nil then self:load() end
```

### 4. String concatenation with nil crashes

```lua
-- WRONG - crashes if name is nil
local msg = "Hello " .. name

-- CORRECT
local msg = "Hello " .. tostring(name)
```

**When it matters:** Logging, error messages, UI text — anywhere a variable might be nil at runtime.

## Balatro Mod Patterns

### 5. Cache original state BEFORE modifications

When modifying card/joker state (sprites, dimensions, effects), always cache the original values before any changes.

```lua
-- WRONG - caches AFTER modification, first use gets wrong values
function modify_card(card)
    card.T.h = card.T.h * 0.7
    card._original_h = card.T.h  -- already modified!
end

-- CORRECT - cache first
function modify_card(card)
    card._original_h = card._original_h or card.T.h  -- cache original
    card.T.h = card.T.h * 0.7
end
```

### 6. Aspect ratio scaling — use ratio of change

When scaling visual elements that have aspect ratio changes, use the ratio of change (new/old), not the raw dimension ratio.

```lua
-- WRONG - double-scales: background AND sprite both shrink
local scale = new_height / original_height  -- e.g. 0.7
background.scale = scale
sprite.scale = scale  -- 0.7 * 0.7 = 0.49 total

-- CORRECT - scale by the change factor
local change_ratio = new_height / old_height
sprite.scale = sprite.scale * change_ratio
```

### 7. Validate state before structural transforms

Check conditions before structural changes (alignment, sticker placement, transforms), or card data and visuals desync.

```lua
-- WRONG - early return before dimension check causes sticker mismatch
if not card.ability then return end
-- dimension check never runs, stickers placed at wrong position

-- CORRECT - validate dimensions even on early paths
update_dimensions(card)
if not card.ability then return end
```

### 8. Overlay/modal cleanup on ALL exit paths

Transient UI modes (overlays, modals, popups) must reset pending state on every exit path — not just the primary close button.

```lua
-- WRONG - only resets on confirm, back button leaks state
function overlay:confirm()
    self.pending = nil
    self:close()
end

-- CORRECT - reset on every exit
function overlay:close()
    self.pending = nil  -- always clean up
    -- ... close logic
end
```

### 9. Sync path performance — O(N) compounds

Multiple O(N) operations in synchronous code paths compound with scale. With 50+ items (saves, cards, jokers), this causes frame drops.

```lua
-- WRONG - three O(N) passes in one sync call
function update_all()
    prune_old()        -- O(N) scan
    rebuild_index()    -- O(N) rebuild
    shift_array()      -- O(N) shift
end

-- CORRECT - batch operations, use counters, defer non-critical work
function update_all()
    if needs_prune then prune_old() end  -- only when needed
    -- use counter instead of index rebuild
    -- defer array compaction to idle
end
```

**When it matters:** Save management, large card collections, shop displays — anything that scales with player progression.

### 10. Filtered UI needs reverse index mapping

When displaying filtered/paginated views, filtered indices don't match the full list. Jump-to-current and focus break without a reverse mapping.

```lua
-- WRONG - uses filtered index to access full list
local item = full_list[filtered_index]  -- wrong item!

-- CORRECT - maintain mapping
local full_index = filtered_to_full[filtered_index]
local item = full_list[full_index]
```
