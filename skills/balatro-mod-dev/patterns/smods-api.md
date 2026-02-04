# SMODS API Patterns

Steamodded (SMODS) is the primary mod loader for Balatro. These patterns are extracted from working mods.

## Mod Registration

### Basic mod.json / smods.json

```json
{
    "id": "MyMod",
    "name": "My Awesome Mod",
    "version": "1.0.0",
    "description": ["A description of what the mod does"],
    "prefix": "mymod",
    "author": ["Your Name"],
    "main_file": "main.lua",
    "dependencies": ["Steamodded>=1.0.0~BETA-1221a"]
}
```

### Main Entry Point

```lua
-- main.lua
MY_MOD = {}
MY_MOD.mod = SMODS.current_mod

-- Configuration
MY_MOD.config = SMODS.current_mod.config

-- Load additional files
local ui = SMODS.load_file("ui.lua")()
```

## Configuration Tab

### Basic Config Tab

```lua
SMODS.current_mod.config_tab = function()
    return {
        n = G.UIT.ROOT,
        config = { 
            align = "cm", 
            padding = 0.1, 
            colour = G.C.CLEAR 
        },
        nodes = {
            -- Toggle option
            {
                n = G.UIT.R,
                config = { align = "cl", padding = 0.05 },
                nodes = {
                    {n = G.UIT.T, config = {text = "Enable Feature", scale = 0.4, colour = G.C.UI.TEXT_LIGHT}},
                    create_toggle({
                        col = true,
                        label = "",
                        ref_table = MY_MOD.config,
                        ref_value = "feature_enabled",
                        callback = function(v) 
                            -- Optional callback when toggled
                        end
                    })
                }
            }
        }
    }
end
```

### Two-Column Layout (from JokerDisplay)

```lua
SMODS.current_mod.config_tab = function()
    local left_column = {n = G.UIT.C, config = {align = "tl", padding = 0.1}, nodes = {}}
    local right_column = {n = G.UIT.C, config = {align = "tl", padding = 0.1}, nodes = {}}
    
    -- Add items to columns
    table.insert(left_column.nodes, create_toggle({...}))
    table.insert(right_column.nodes, create_toggle({...}))
    
    return {
        n = G.UIT.ROOT,
        config = {align = "cm", padding = 0.1, colour = G.C.CLEAR},
        nodes = {
            {n = G.UIT.R, config = {align = "tm"}, nodes = {left_column, right_column}}
        }
    }
end
```

## Localization

### File Structure

```
localization/
├── en-us.lua     # Required (English)
└── zh_CN.lua     # Chinese
```

### Localization File Format

```lua
-- localization/en-us.lua
return {
    descriptions = {
        Joker = {
            j_mymod_custom = {
                name = "Custom Joker",
                text = {
                    "Line 1 of description",
                    "{C:mult}+#1#{} Mult"
                }
            }
        }
    },
    misc = {
        dictionary = {
            mymod_setting_label = "Setting Label",
            mymod_alert_message = "Alert: %s"
        }
    }
}
```

### Loading Localization

```lua
-- In main.lua
SMODS.handle_loc_file(MY_MOD.mod.path, MY_MOD.mod.id)
```

### Using Localized Strings

```lua
-- Direct access
local text = G.localization.misc.dictionary.mymod_setting_label

-- With formatting (use localize function)
local formatted = localize{type = 'variable', key = 'mymod_alert_message', vars = {"value"}}
```

## Function Hooks

### Hook Pattern (Preserve Original)

```lua
-- Save original
local original_func = Game.some_function

-- Replace with wrapper
function Game:some_function(...)
    -- Pre-processing
    local result = original_func(self, ...)
    -- Post-processing
    return result
end
```

### Safe Hook (Check Existence)

```lua
if not Game._mymod_hooked_func then
    Game._mymod_hooked_func = Game.some_function
    function Game:some_function(...)
        local result = Game._mymod_hooked_func(self, ...)
        MY_MOD.on_func_called(self, result)
        return result
    end
end
```

## SMODS APIs

### Card Limit Display (no_card_count)

Hide vanilla card count label:
```lua
-- In CardArea context
self.config.no_card_count = true
```

### Card Limits (SMODS slot system)

```lua
-- SMODS stores card limits in:
self.config.card_limits.total_slots  -- Total available slots
self.config.card_limits.default      -- Default slot count

-- Vanilla stores in:
self.config.card_limit               -- Single value

-- Conditional access:
local limit = SMODS and self.config.card_limits and self.config.card_limits.total_slots 
              or self.config.card_limit
```

### Discovery/Unlock Flags (Internal)

SMODS uses internal flags to prevent double-initialization:

```lua
-- These are set on items in G.P_CENTERS, G.P_BLINDS, G.P_TAGS, G.P_SEALS
item._saved_d_u                      -- Backup of discovered/unlocked
item._discovered_unlocked_overwritten -- Post-load flag

-- If you need to re-init (e.g., profile switch), clear these:
for _, tbl in ipairs({G.P_CENTERS, G.P_BLINDS, G.P_TAGS, G.P_SEALS}) do
    if tbl then
        for k,v in pairs(tbl) do
            v._saved_d_u = nil
            v._discovered_unlocked_overwritten = nil
        end
    end
end
```

## Debugging

### Check SMODS Loaded

```lua
if SMODS then
    -- SMODS is available
end
```

### Check Specific Version

```lua
if SMODS and SMODS.can_load then
    -- Modern SMODS
end
```

### Print Debug Info

```lua
-- Safe print that works even if console unavailable
pcall(print, "[MyMod] Debug message")

-- Or use sendDebugMessage if available
if sendDebugMessage then
    sendDebugMessage("Debug message")
end
```

## Common Patterns from Working Mods

### SaveRewinder: State Persistence

```lua
-- Store state in G.GAME for save compatibility
G.GAME.mymod_state = G.GAME.mymod_state or {
    value1 = 0,
    value2 = "default"
}
```

### Blueprint: Shader Loading

```lua
-- Load custom shader
local shader = love.graphics.newShader(MY_MOD.mod.path .. "assets/shaders/effect.fs")
```

### JokerDisplay: Conditional UI

```lua
-- Platform-aware text node
{n = G.UIT.T, config = {
    text = "Label",
    scale = 0.3,
    lang = G.F_MOBILE_UI and G.LANGUAGES and G.LANGUAGES['en-us'] or nil,
    colour = G.C.WHITE
}}
```
