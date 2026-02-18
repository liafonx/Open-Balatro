# Balatro Global Variables Reference

Quick reference for commonly used global variables and tables.

## G - Root Global

All game state is accessed through the global `G` table.

## G.GAME - Current Game State

Active run state. Store mod state here for save compatibility.

```lua
G.GAME = {
    -- Round info
    round = 1,                    -- Current round (1-indexed)
    round_resets = {},            -- Round reset tracking
    
    -- Resources
    dollars = 4,                  -- Current money
    chips = 0,                    -- Current chip count
    hands_played = 0,             -- Hands played this round
    discards_used = 0,            -- Discards used this round
    
    -- Blind info
    blind = {                     -- Current blind
        name = "Small Blind",
        chips = 300,
        mult = 1
    },
    
    -- Joker tracking
    joker_buffer = 0,             -- Joker count buffer
    
    -- Progress
    ante = 1,                     -- Current ante (1-8)
    boss_blind_id = "",           -- Current boss blind
    
    -- Settings
    selected_back = {},           -- Selected deck back
    
    -- For mod state (recommended pattern)
    my_mod_state = {},            -- Add your mod's state here
}
```

### Storing Mod State

```lua
-- Initialize (safe pattern)
G.GAME.my_mod = G.GAME.my_mod or {
    counter = 0,
    enabled = true
}

-- Access
local my_state = G.GAME.my_mod
my_state.counter = my_state.counter + 1
```

## G.STATES - Game State Enum

```lua
G.STATES = {
    MENU = 0,              -- Main menu
    SELECTING_HAND = 1,    -- Selecting cards to play
    HAND_PLAYED = 2,       -- Hand being scored
    SHOP = 3,              -- In shop
    BLIND_SELECT = 4,      -- Selecting blind
    GAME_OVER = 5,         -- Game over screen
    TUTORIAL = 6,          -- Tutorial
    DECK_SELECTION = 7,    -- Deck selection
    STANDARD_PACK = 8,     -- Opening standard pack
    NEW_ROUND = 9,         -- New round transition
    TAROT_PACK = 10,       -- Opening tarot pack
    PLANET_PACK = 11,      -- Opening planet pack
    SPECTRAL_PACK = 12,    -- Opening spectral pack
    BUFFOON_PACK = 13,     -- Opening buffoon pack
    SANDBOX = 14,          -- Sandbox mode
    SPLASH = 15,           -- Splash screen
    ROUND_EVAL = 16,       -- Round evaluation
}

-- Usage
if G.STATE == G.STATES.SHOP then
    -- In shop
end
```

## G.P_* - Prototype Tables

Item definitions. SMODS adds discovery/unlock flags to these.

### G.P_CENTERS

All center items (jokers, consumables, vouchers, etc.)

```lua
G.P_CENTERS = {
    j_joker = {           -- Joker entry
        name = "Joker",
        key = "j_joker",
        set = "Joker",
        discovered = true,
        unlocked = true,
        -- SMODS flags (internal)
        _saved_d_u = true,
        _discovered_unlocked_overwritten = true
    },
    -- ... more items
}
```

### G.P_BLINDS

Blind definitions.

```lua
G.P_BLINDS = {
    bl_small = { name = "Small Blind", mult = 1, ... },
    bl_big = { name = "Big Blind", mult = 1.5, ... },
    bl_hook = { name = "The Hook", boss = true, ... },
    -- ... boss blinds
}
```

### G.P_TAGS

Tag definitions.

### G.P_SEALS

Seal definitions.

## CardArea Globals

```lua
G.hand        -- Hand CardArea (cards in hand)
G.jokers      -- Jokers CardArea
G.deck        -- Deck CardArea
G.consumeables-- Consumables CardArea
G.shop        -- Shop CardArea
G.pack_cards  -- Pack cards CardArea
```

### CardArea Properties

```lua
G.jokers.config.card_limit         -- Vanilla slot limit
G.jokers.config.card_limits        -- SMODS limits table
G.jokers.config.card_limits.total_slots  -- SMODS total
G.jokers.config.no_card_count      -- Hide count label (SMODS API)
G.jokers.cards                     -- Array of cards in area
```

## G.C - Color Constants

```lua
G.C.WHITE = {1, 1, 1, 1}
G.C.BLACK = {0, 0, 0, 1}
G.C.RED = {1, 0.2, 0.2, 1}
G.C.GREEN = {0.2, 1, 0.2, 1}
G.C.BLUE = {0.2, 0.2, 1, 1}
G.C.GOLD = {0.8, 0.7, 0.3, 1}
G.C.MONEY = G.C.GOLD
G.C.MULT = G.C.RED
G.C.CHIPS = G.C.BLUE
G.C.CLEAR = {0, 0, 0, 0}

-- UI colors
G.C.UI = {
    TEXT_LIGHT = {0.8, 0.8, 0.8, 1},
    TEXT_DARK = {0.2, 0.2, 0.2, 1},
    BACKGROUND_DARK = {0.1, 0.1, 0.1, 1}
}
```

## G.FRAMES - Frame Counters

```lua
G.FRAMES = {
    DRAW = 1,     -- Current draw frame (increments each frame)
    UPDATE = 1,   -- Current update frame
}
```

Used for FRAME.DRAW system (see ui-system.md).

## G.CONTROLLER - Input State

```lua
G.CONTROLLER = {
    HID = {
        touch = false,      -- Touch input active
        controller = false, -- Controller connected
    },
    hovering = {
        target = nil,       -- Currently hovered element
    },
    clicked = {
        target = nil,       -- Currently clicked element (mobile)
    },
    dragging = {
        target = nil,       -- Currently dragged element
    },
}

-- Usage
if G.CONTROLLER.HID.touch then
    -- Mobile-specific code
end
```

## G.F_* - Feature Flags

```lua
G.F_MOBILE_UI = true/false    -- Mobile UI mode
G.F_CRT = true/false          -- CRT shader enabled
G.F_SOUND = true/false        -- Sound enabled
G.F_MUSIC = true/false        -- Music enabled
G.F_VERBOSE = true/false      -- Verbose logging
```

## G.I - Instance Lists

Lists of objects for draw/update loops.

```lua
G.I.UIBOX     -- All UIBoxes
G.I.CARDAREA  -- All CardAreas
G.I.CARD      -- All Cards
G.I.ALERT     -- Alert overlays
G.I.POPUP     -- Popup dialogs
```

## Localization

```lua
G.LANGUAGES = {
    ['en-us'] = { ... },
    ['zh_CN'] = { ... },
}

G.localization = {
    misc = {
        dictionary = {
            -- Key-value strings
        }
    },
    descriptions = {
        Joker = {
            -- Joker descriptions
        }
    }
}
```

## Accessing Localized Strings

```lua
-- Direct access
local text = G.localization.misc.dictionary.some_key

-- Using localize function
local text = localize('some_key')
local text = localize{type = 'variable', key = 'key_with_vars', vars = {value1}}
```

## Common Patterns

### Check Game State
```lua
if G.STATE == G.STATES.SHOP then
    -- In shop
end

if G.GAME.blind.boss then
    -- Fighting boss blind
end
```

### Check Round Progress
```lua
local is_first_hand = G.GAME.hands_played == 0
local is_first_discard = G.GAME.discards_used == 0
local current_round = G.GAME.round
local current_ante = G.GAME.ante
```

### Check Platform
```lua
if G.F_MOBILE_UI then
    -- Mobile UI
end

if G.CONTROLLER.HID.touch then
    -- Touch input active
end
```

### Safe Global Access
```lua
-- Always check existence
if G and G.GAME and G.GAME.round then
    local round = G.GAME.round
end

-- For optional features
local limit = (SMODS and G.jokers.config.card_limits) 
              and G.jokers.config.card_limits.total_slots 
              or G.jokers.config.card_limit
```
