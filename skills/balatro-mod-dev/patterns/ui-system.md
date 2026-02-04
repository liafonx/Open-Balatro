# Balatro UI System Patterns

Understanding Balatro's UI system is critical for mods that modify display or interaction.

## UIBox Architecture

### Structure

```
UIBox
  └── UIRoot (ROOT node)
      ├── children[1] = Container row (background)
      └── children[2] = Content row (text/elements)
          ├── children[1] = First element
          ├── children[2] = Second element
          └── ...
```

### Drawing Methods

```lua
UIBox:draw()           -- Full draw (background + content)
UIElement:draw_self()  -- Only this element
UIElement:draw_children() -- Only children of this element
```

### Creating a UIBox

```lua
local my_box = UIBox{
    definition = {
        n = G.UIT.ROOT,
        config = { align = "cm", colour = G.C.CLEAR },
        nodes = {
            {n = G.UIT.R, config = {align = "cm"}, nodes = {
                {n = G.UIT.T, config = {text = "Label", scale = 0.3, colour = G.C.WHITE}}
            }}
        }
    },
    config = {
        align = 'cm',
        offset = {x = 0, y = 0},
        major = parent_element,  -- For positioning
        parent = parent_element  -- For draw hierarchy
    }
}
```

## FRAME.DRAW System

Prevents duplicate drawing per frame.

### How It Works

```lua
function UIBox:draw()
    -- Skip if already drawn this frame
    if self.FRAME.DRAW >= G.FRAMES.DRAW and not G.OVERLAY_TUTORIAL then 
        return 
    end
    self.FRAME.DRAW = G.FRAMES.DRAW  -- Mark as drawn
    
    -- ... actual drawing
end
```

### Manipulation Patterns

**Skip vanilla draw (before calling original):**
```lua
if self.children.area_uibox then
    self.children.area_uibox.FRAME.DRAW = G.FRAMES.DRAW  -- Pretend already drawn
end
original_draw(self, ...)
```

**Force redraw (after calling original):**
```lua
original_draw(self, ...)
if self.children.area_uibox then
    self.children.area_uibox.FRAME.DRAW = 0  -- Reset so it can draw again
    self.children.area_uibox:draw()
end
```

**Key insight:** `G.FRAMES.DRAW` starts at 1 and increments each frame. Setting `FRAME.DRAW = G.FRAMES.DRAW` means "already drawn this frame". Setting to 0 means "not drawn yet".

## Draw Order

### Global Draw Order (game.lua)

```
1. G.I.UIBOX loop      - UIBoxes WITHOUT parent
2. G.I.CARDAREA loop   - CardAreas (calls CardArea:draw())
3. G.I.CARD loop       - Individual cards
4. G.I.ALERT loop      - Alert overlays (NO parent check)
5. G.I.POPUP loop      - Popup dialogs
```

**Important:** UIBoxes with `parent` set are NOT drawn in the UIBOX loop. They're drawn explicitly by their parent.

### CardArea Draw Order

```lua
function CardArea:draw(...)
    -- 1. area_uibox:draw() - Label drawn FIRST (line ~313)
    self.children.area_uibox:draw()
    
    -- 2. Cards drawn (lines ~319-365)
    for _, card in ipairs(self.cards) do
        card:draw()
    end
end
```

**Result:** Label is BEHIND cards (drawn first = behind).

### Custom Draw Order Example

To draw label ON TOP of cards:

```lua
local orig_draw = CardArea.draw
function CardArea:draw(...)
    if should_customize then
        -- 1. Prevent vanilla label draw
        if self.children.area_uibox then
            self.children.area_uibox.FRAME.DRAW = G.FRAMES.DRAW
        end
        
        -- 2. Draw background only
        local bg = self.children.area_uibox.UIRoot.children[1]
        if bg then bg:draw_self() end
        
        -- 3. Draw cards (vanilla)
        orig_draw(self, ...)
        
        -- 4. Draw text on top
        local text = self.children.area_uibox.UIRoot.children[2]
        if text then
            for _, child in ipairs(text.children or {}) do
                child:draw_self()
            end
        end
    else
        orig_draw(self, ...)
    end
end
```

## Collision System

### Draw Order = Collision Priority

**Rule:** Last drawn = first checked for collision.

If you draw an overlay on top of cards, it will intercept all clicks unless you disable its collision.

### Collision States

```lua
node.states.collide = {
    can = true,   -- Can receive collision events?
    is = false    -- Currently being collided?
}
```

### Disable Collision on Overlays

```lua
-- When creating overlay that shouldn't block clicks
overlay.states.collide.can = false

-- Or after creation
my_uibox.UIRoot.states.collide.can = false
```

### Common Issue: Clicks Blocked

**Symptom:** Cards become unresponsive after drawing overlay.

**Cause:** Overlay covers CardArea and intercepts collision.

**Fix:** Disable collision on the overlay:
```lua
self.children.area_uibox.states.collide.can = false
```

## Node States

### State Structure

```lua
node.states = {
    visible = true,              -- Is visible?
    click = { can = false, is = false },   -- Can be clicked?
    collide = { can = true, is = false },  -- Can receive collision?
    drag = { can = false, is = false },    -- Can be dragged?
    hover = { is = false },      -- Currently hovered?
    focus = { is = false },      -- Has focus?
}
```

### Enabling Interactions

```lua
-- Enable clicking (required for custom click handlers)
element.states.click.can = true

-- Enable dragging
element.states.drag.can = true

-- Disable collision (for overlays)
element.states.collide.can = false
```

### Visibility Control

```lua
-- Hide element
element.states.visible = false

-- Show element
element.states.visible = true
```

**Warning:** Setting `visible = false` may have side effects. Test carefully.

## UI Node Types

### Common Node Types

```lua
G.UIT.ROOT  -- Root container
G.UIT.R     -- Row (horizontal layout)
G.UIT.C     -- Column (vertical layout)
G.UIT.T     -- Text
G.UIT.O     -- Object (sprites, etc.)
G.UIT.B     -- Box/background
```

### Text Node

```lua
{n = G.UIT.T, config = {
    text = "Static text",           -- OR
    ref_table = some_table,         -- Dynamic text
    ref_value = "key",              -- from ref_table[ref_value]
    scale = 0.3,
    colour = G.C.WHITE,
    lang = G.LANGUAGES['en-us'],    -- For mobile
    shadow = true                   -- Add shadow
}}
```

### Dynamic Value Display

```lua
{n = G.UIT.T, config = {
    ref_table = G.GAME,
    ref_value = "dollars",  -- Displays G.GAME.dollars
    scale = 0.4,
    colour = G.C.MONEY
}}
```

## Common Patterns

### Create Alert/Overlay

```lua
local alert = UIBox{
    definition = {...},
    config = {
        align = 'cm',
        instance_type = "ALERT"  -- Drawn in ALERT phase
    }
}
-- Add to alert list
G.I.ALERT[#G.I.ALERT + 1] = alert
```

### area_uibox Reference

The CardArea label is stored in `self.children.area_uibox`:

```lua
-- Access in CardArea context
if self.children and self.children.area_uibox then
    -- Manipulate the label UIBox
end
```

**Warning:** `area_uibox` is created INSIDE `CardArea:draw()`. It doesn't exist before first draw.

### Safe UIBox Access

```lua
-- Always check existence
if self.children 
   and self.children.area_uibox 
   and self.children.area_uibox.UIRoot 
   and self.children.area_uibox.UIRoot.children then
    -- Safe to access children
end
```
