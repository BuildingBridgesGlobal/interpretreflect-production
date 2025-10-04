# Color Accessibility Audit & Fix

## Current Color Palette Issues

### Problematic Light Greens (FAIL WCAG AA)

These colors have insufficient contrast against white backgrounds:

1. **#A8C09A** (Light sage green)
   - RGB: 168, 192, 154
   - Contrast vs white: 1.97:1 ❌ (Needs 4.5:1 for normal text)
   - Used in: Headers, navigation, buttons, overlays

2. **#B5CCA8** (Pale green)
   - RGB: 181, 204, 168
   - Contrast vs white: 1.75:1 ❌
   - Used in: Gradients, hover states

3. **#C8D5C8** (Very light green)
   - RGB: 200, 213, 200
   - Contrast vs white: 1.41:1 ❌
   - Used in: Icons, subtle backgrounds

### Acceptable Greens (PASS WCAG AA)

These can be kept but should be used carefully:

4. **#6B8B60** (Medium green)
   - RGB: 107, 139, 96
   - Contrast vs white: 3.71:1 ⚠️ (Passes for large text only)
5. **#5F7F55** (Dark green)
   - RGB: 95, 127, 85
   - Contrast vs white: 4.76:1 ✅ (Passes for normal text)

### Background Colors (Acceptable)

6. **#FAF9F6** (Off-white background) - OK for backgrounds
7. **#F0EDE8** (Light beige) - OK for backgrounds

## New Accessible Green Palette

### Primary Greens (WCAG AA Compliant)

1. **#4A6B3E** (Forest Green) - Primary
   - RGB: 74, 107, 62
   - Contrast vs white: 7.02:1 ✅
   - Use for: Headers, primary buttons, important text

2. **#5C7F4F** (Sage Green) - Secondary
   - RGB: 92, 127, 79
   - Contrast vs white: 4.92:1 ✅
   - Use for: Secondary buttons, navigation active states

3. **#3D5A33** (Deep Forest) - Dark Accent
   - RGB: 61, 90, 51
   - Contrast vs white: 9.42:1 ✅
   - Use for: Text on light backgrounds, strong emphasis

### Supporting Colors

4. **#7A9B6E** (Muted Sage) - For large text only
   - RGB: 122, 155, 110
   - Contrast vs white: 3.15:1 ⚠️
   - Use for: Large headings, decorative elements (not body text)

5. **#E8F0E4** (Light Green Tint) - Background only
   - RGB: 232, 240, 228
   - Use for: Subtle backgrounds, cards (with dark text)

6. **#F4F8F2** (Very Light Green) - Background only
   - RGB: 244, 248, 242
   - Use for: Page backgrounds, subtle sections

## Replacement Strategy

### Phase 1: Critical Accessibility Fixes

- Replace #A8C09A → #5C7F4F (for interactive elements)
- Replace #B5CCA8 → #5C7F4F (for text and borders)
- Replace #C8D5C8 → #7A9B6E (for large text only) or #E8F0E4 (for backgrounds)

### Phase 2: Gradient Updates

- Old: linear-gradient(135deg, #A8C09A 0%, #B5CCA8 100%)
- New: linear-gradient(135deg, #5C7F4F 0%, #7A9B6E 100%)

### Phase 3: Hover States

- Light hover: #E8F0E4 (background) with #3D5A33 (text)
- Dark hover: Darken by 10% using opacity or darker shade

## Implementation Notes

1. **Text on green backgrounds**: Always use white (#FFFFFF) or very dark green (#2A3F26)
2. **Icons**: Use #4A6B3E instead of light greens
3. **Borders**: Use #5C7F4F for visible borders
4. **Focus states**: Add 3px outline with #4A6B3E
5. **Disabled states**: Use opacity 0.6 on the darker greens

## Testing Checklist

- [ ] All text has 4.5:1 contrast ratio (normal size)
- [ ] All large text has 3:1 contrast ratio
- [ ] Interactive elements have 3:1 contrast ratio
- [ ] Focus indicators are clearly visible
- [ ] Color is not the only way to convey information
