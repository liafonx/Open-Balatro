# Mobile Compatibility Patterns

Desktop and mobile (iOS/Plus) Balatro have significant differences. These patterns help write cross-platform mods.

## Platform Detection

```lua
-- Check if running on mobile
if G.F_MOBILE_UI then
    -- Mobile-specific code
end

-- Check for touch input
if G.CONTROLLER.HID.touch then
    -- Touch is active
end
```

## Key Differences

### Input Handling

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Click detection | Controller hook checks `hovering.target` | `:click()` method on `clicked.target` |
| When hook runs | DURING press event | AFTER press event |
| Drag handling | `drag.target` set immediately | `drag.target` may be delayed |

**Desktop Click Hook:**
```lua
local orig = Controller.queue_L_cursor_press
function Controller:queue_L_cursor_press(x, y)
    orig(self, x, y)
    if self.hovering.target and self.hovering.target.MY_ELEMENT then
        -- Handle click
    end
end
```

**Mobile Click Method:**
```lua
function MyElement:click()
    if not G.CONTROLLER.HID.touch then return end  -- Mobile-only guard
    -- Handle click
end
```

**Cross-Platform Solution:**
```lua
-- Enable click registration
self.states.click.can = true

-- Desktop: Controller hook
local orig = Controller.queue_L_cursor_press
function Controller:queue_L_cursor_press(x, y)
    orig(self, x, y)
    if self.hovering.target and self.hovering.target.is_my_element then
        self.hovering.target:handle_click()
    end
end

-- Mobile: click() method
function MyElement:click()
    if not G.CONTROLLER.HID.touch then return end
    self:handle_click()
end

-- Shared handler
function MyElement:handle_click()
    -- Actual click logic here
end
```

### UI Text Nodes

**Desktop:**
```lua
{n=G.UIT.T, config={
    ref_table = self.config, 
    ref_value = 'card_count', 
    scale = 0.3, 
    colour = G.C.WHITE
}}
```

**Mobile (has `lang` parameter):**
```lua
{n=G.UIT.T, config={
    ref_table = self.config, 
    ref_value = 'card_count', 
    scale = 0.3, 
    lang = G.LANGUAGES['en-us'],  -- Controls CRT shader, z-ordering
    colour = G.C.WHITE
}}
```

**Cross-Platform Text Node:**
```lua
{n=G.UIT.T, config={
    text = "Label",
    scale = 0.3,
    lang = G.F_MOBILE_UI and G.LANGUAGES and G.LANGUAGES['en-us'] or nil,
    colour = G.C.WHITE
}}
```

### CardArea:draw() Differences

**Draw Order (both platforms):**
1. `area_uibox:draw()` - Label drawn FIRST
2. Cards drawn - Jokers, hand cards, etc.
3. Function ends

**Result:** Vanilla label is BEHIND cards.

**To draw label ON TOP of cards:**
```lua
local cardarea_draw_ref = CardArea.draw
function CardArea:draw(...)
    if self == G.jokers and MY_MOD.config.label_on_top then
        -- Skip vanilla label draw
        if self.children and self.children.area_uibox then
            self.children.area_uibox.FRAME.DRAW = G.FRAMES.DRAW
        end
        
        -- Draw background (behind cards)
        if self.children.area_uibox and self.children.area_uibox.UIRoot then
            local container = self.children.area_uibox.UIRoot.children[1]
            if container and container.draw_self then
                container:draw_self()
            end
        end
        
        -- Draw cards (vanilla)
        cardarea_draw_ref(self, ...)
        
        -- Draw text on top
        if self.children.area_uibox then
            local text_row = self.children.area_uibox.UIRoot.children[2]
            if text_row and text_row.children then
                for _, child in ipairs(text_row.children) do
                    if child.draw_self then child:draw_self() end
                end
            end
        end
    else
        cardarea_draw_ref(self, ...)
    end
end
```

## FRAME.DRAW System

UIBox uses frame tracking to prevent duplicate draws.

```lua
function UIBox:draw()
    if self.FRAME.DRAW >= G.FRAMES.DRAW then return end  -- Already drawn
    self.FRAME.DRAW = G.FRAMES.DRAW
    -- ... actual drawing
end
```

**Manipulation:**
```lua
-- Prevent draw (set to current frame)
self.children.area_uibox.FRAME.DRAW = G.FRAMES.DRAW

-- Allow draw again (reset)
self.children.area_uibox.FRAME.DRAW = 0
```

## Node State System

States are capability flags:

```lua
node.states = {
    click = { can = false, is = false },   -- Can be clicked?
    collide = { can = true, is = false },  -- Can receive collision?
    visible = true,
    drag = { can = false, is = false },
}
```

**Enable clicking:**
```lua
self.states.click.can = true
```

**Disable collision (for overlays):**
```lua
self.states.collide.can = false
```

## Lovely Patch Patterns for Both Platforms

When patching code that differs between desktop and mobile:

```toml
# Desktop pattern
[[patches]]
[patches.pattern]
target = "cardarea.lua"
pattern = "{n=G.UIT.T, config={ref_table = self.config, ref_value = 'card_limit'"
position = "at"
payload = "..."

# Mobile pattern (separate entry - has lang parameter)
[[patches]]
[patches.pattern]
target = "cardarea.lua"
pattern = "{n=G.UIT.T, config={ref_table = self.config, ref_value = 'card_limit', scale = 0.3, lang = G.LANGUAGES['en-us']"
position = "at"
payload = "..."
```

## Common Mobile Issues

### 1. Double Labels

**Problem:** Both vanilla and mod labels visible.

**Cause:** Overlay approach works on desktop (perfect overlap) but not mobile.

**Solutions:**
- Use `self.config.no_card_count = true` to hide vanilla
- Or use manual draw ordering (see CardArea:draw pattern above)

### 2. Click Delay

**Problem:** Tap triggers on next action, not immediately.

**Cause:** Missing `:click()` method on custom elements.

**Fix:** Implement both Controller hook (desktop) and `:click()` method (mobile).

### 3. Font/Rendering Mismatch

**Problem:** Text looks different on mobile.

**Cause:** Missing `lang` parameter on UIText nodes.

**Fix:** Add `lang = G.F_MOBILE_UI and G.LANGUAGES['en-us'] or nil`

### 4. Touch Control Stuck

**Problem:** After button click, touch controls don't reset.

**Cause:** Mobile doesn't auto-reset control state.

**Fix:** Add in button callbacks:
```lua
if G.CONTROLLER.HID.touch then
    G.CONTROLLER.dragging = nil
    G.CONTROLLER.hovering = {}
end
```

## Testing Mobile Compatibility

1. **Check for G.F_MOBILE_UI usage** - All platform-specific code should be guarded
2. **Test both input paths** - Controller hooks AND click() methods
3. **Verify text rendering** - Check `lang` parameter on all UIText nodes
4. **Test draw order** - Verify overlays appear correctly
5. **Check collision** - Ensure overlays don't block underlying elements

## Source File Reference

| Desktop | Mobile | Key Lines |
|---------|--------|-----------|
| `balatro_src/cardarea.lua` | `plus_game/cardarea.lua` | 270-408 |
| `balatro_src/engine/ui.lua` | `plus_game/engine/ui.lua` | 283-302 |
| `balatro_src/engine/controller.lua` | `plus_game/engine/controller.lua` | 370-486 |
| `balatro_src/engine/node.lua` | `plus_game/engine/node.lua` | 55-62 |
