# Balatro Game Files Reference

Quick reference for what's in each game source file. Use Desktop Commander to search for specific functions.

## Search Tips

```bash
# Search desktop game source
grep -rn "function Game:start_run" ~/Development/GitWorkspace/Balatro_src/desktop/

# Compare desktop vs iOS
diff ~/Development/GitWorkspace/Balatro_src/desktop/cardarea.lua \
     ~/Development/GitWorkspace/Balatro_src/ios_plus/cardarea.lua

# Search Steamodded source for API patterns
grep -rn "SMODS.Joker" ~/Development/GitWorkspace/smods/src/

# Search Steamodded lovely patches for injection examples
grep -rn "patches.pattern" ~/Development/GitWorkspace/smods/lovely/

# Find how other mods implement features
grep -rn "pattern_to_find" ~/Library/Application\ Support/Balatro/Mods/
```

### Game Source Locations

| Version | Path | Use Case |
|---------|------|----------|
| Desktop | `~/Development/GitWorkspace/Balatro_src/desktop/` | Primary reference |
| iOS Plus | `~/Development/GitWorkspace/Balatro_src/ios_plus/` | Mobile UI patterns |
| iOS Full | `~/Development/GitWorkspace/Balatro_src/ios_full/` | Full iOS version |
| iOS Unpack | `~/Development/GitWorkspace/Balatro_src/ios_unpack/` | Script-generated |

## Core Files

### game.lua

Main game state and lifecycle.

| Function/Table | Purpose | Common Hooks |
|----------------|---------|--------------|
| `Game:start_run(args)` | Initialize a new/loaded run | Hook for save loading |
| `Game:update(dt)` | Main game loop | Hook for per-frame logic |
| `Game:draw()` | Main draw loop | Global draw order control |
| `Game:delete_run()` | Clean up run state | Hook for cleanup |
| `Game:init_item_prototypes()` | Initialize game items | SMODS discovery flags |

For `G.GAME` and `G.STATES` details, see `reference/globals.md`.

**Search tip:** `grep -rn "function Game:start_run" ~/Development/balatro_src/`

### globals.lua

Global state and configuration.

| Variable | Purpose |
|----------|---------|
| `G` | Root global table |

For complete globals reference (G.GAME, G.STATES, G.P_*, etc.), see `reference/globals.md`.

### main.lua

Entry point and love2d callbacks.

| Function | Purpose |
|----------|---------|
| `love.load()` | Game initialization |
| `love.update(dt)` | Update loop |
| `love.draw()` | Draw loop |
| `love.keypressed(key)` | Keyboard input |

## Functions Directory

### functions/misc_functions.lua

Utility and save functions.

| Function | Purpose | Lines (approx) |
|----------|---------|----------------|
| `save_run()` | Save current run | 1847-1923 |
| `load_run()` | Load saved run | |
| `number_format(num)` | Format numbers for display | |
| `scale_number(num, scale)` | Calculate text scale | |
| `G.FUNCS.*` | UI callback functions | |

**Search tip:** `start_search pattern="function save_run"`

### functions/button_callbacks.lua

UI button handlers.

| Function | Purpose |
|----------|---------|
| `G.FUNCS.play_hand()` | Play hand button |
| `G.FUNCS.discard_hand()` | Discard button |
| `G.FUNCS.select_blind()` | Select blind |
| `G.FUNCS.skip_blind()` | Skip blind |
| `G.FUNCS.reroll_boss()` | Reroll boss tag |

### functions/UI_definitions.lua

UI construction functions.

| Function | Purpose |
|----------|---------|
| `G.UIDEF.main_menu()` | Main menu UI |
| `G.UIDEF.deck_info()` | Deck info panel |
| `G.UIDEF.run_info()` | Run info display |
| `G.UIDEF.options()` | Options menu |
| `create_UIBox_*()` | Various UI builders |

### functions/state_events.lua

State transitions and animations.

| Function | Purpose |
|----------|---------|
| `ease_to()` | Animated value changes |
| `event_manager` | Event queue system |

## Engine Directory

### engine/ui.lua

UI framework core.

| Class/Function | Purpose | Key Lines |
|----------------|---------|-----------|
| `UIBox` | UI container class | |
| `UIBox:draw()` | Draw UI box | 283-302 |
| `UIElement` | Base UI element | |
| `UIElement:draw_self()` | Draw single element | |
| `FRAME.DRAW` | Frame tracking | Prevents double-draw |

### engine/controller.lua

Input handling.

| Function | Purpose | Platform |
|----------|---------|----------|
| `Controller:key_press()` | Keyboard input | Desktop |
| `Controller:queue_L_cursor_press()` | Left click | Desktop |
| `Controller:update()` | Input processing | Both |
| `G.CONTROLLER.HID.touch` | Touch active check | Mobile |
| `G.CONTROLLER.hovering.target` | Hovered element | Both |
| `G.CONTROLLER.clicked.target` | Clicked element | Mobile |

### engine/node.lua

Base node class.

| Property | Purpose |
|----------|---------|
| `node.states.visible` | Visibility |
| `node.states.click.can` | Clickable |
| `node.states.collide.can` | Collision enabled |
| `node:click()` | Click handler (mobile) |

## Card Files

### card.lua

Card class and rendering.

| Function | Purpose |
|----------|---------|
| `Card:draw()` | Draw card |
| `Card:highlight()` | Selection highlight |
| `Card:calculate_joker()` | Joker effect calculation |

### cardarea.lua

Card container areas.

| Function | Purpose | Key Lines |
|----------|---------|-----------|
| `CardArea:draw()` | Draw area and cards | 270-408 |
| `CardArea:emplace()` | Add card to area | |
| `CardArea:remove_card()` | Remove card | |
| `self.children.area_uibox` | Card count label | Created in draw() |
| `self.config.card_limit` | Vanilla limit | |
| `self.config.card_limits.total_slots` | SMODS limit | |

### blind.lua

Blind mechanics.

| Function | Purpose |
|----------|---------|
| `Blind:draw()` | Draw blind |
| `Blind:defeat()` | Handle defeat |
| `G.P_BLINDS` | Blind definitions |

## Common Globals Quick Reference

```lua
G.GAME.round              -- Current round number
G.GAME.dollars            -- Current money
G.GAME.chips              -- Current chips
G.GAME.round_resets       -- Round reset data
G.GAME.blind              -- Current blind

G.hand                    -- Hand CardArea
G.jokers                  -- Jokers CardArea
G.shop                    -- Shop CardArea
G.deck                    -- Deck CardArea

G.STATES.MENU             -- 0
G.STATES.SELECTING_HAND   -- 1
G.STATES.HAND_PLAYED      -- 2
G.STATES.SHOP             -- 3
G.STATES.BLIND_SELECT     -- 4
G.STATES.GAME_OVER        -- 5

G.FRAMES.DRAW             -- Current draw frame number
```

## Search Patterns

Configure `BALATRO_SRC` and `MOBILE_SRC` environment variables for your system, or use paths directly.

Find function definition:
```bash
grep -rn "function Game:start_run" ~/Development/balatro_src/
```

Find all uses of a global:
```bash
grep -rn "G.GAME.round" ~/Development/balatro_src/
```

Compare desktop vs mobile:
```bash
# Desktop
grep -rn "CardArea:draw" ~/Development/balatro_src/

# Mobile
grep -rn "CardArea:draw" ~/Development/lovely-mobile-maker/temp_extract/plus_game/
```
