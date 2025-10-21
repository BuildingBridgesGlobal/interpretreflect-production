# Sage Green Color Palette

This document defines the standardized sage green color palette used throughout the InterpretReflect application.

## Primary Colors

### Sage Green (Primary)
- **Hex**: `#6B8268`
- **Usage**: Primary buttons, active navigation tabs, primary actions, borders
- **Example**: Navigation tab active state, primary CTA buttons

### Sage Green Dark
- **Hex**: `#5C7F4F`
- **Usage**: Darker text, headings, hover states, gradients (start)
- **Example**: Section headings, button text on light backgrounds

### Sage Green Light
- **Hex**: `#5B9378`
- **Usage**: Lighter accents, gradients (end), secondary elements
- **Example**: Gradient buttons (paired with dark), progress indicators

### Sage Green Extra Dark
- **Hex**: `#4A6640`
- **Usage**: Very dark text, strong emphasis
- **Example**: Important headings, strong contrast text

## Transparency Variations

### Background Tint (5% opacity)
- **RGBA**: `rgba(107, 130, 104, 0.05)`
- **Usage**: Subtle background highlights, hover states
- **Example**: Card backgrounds, hover effects

### Light Tint (10% opacity)
- **RGBA**: `rgba(107, 130, 104, 0.1)`
- **Usage**: Light backgrounds, subtle containers
- **Example**: Info boxes, light sections

### Border/Divider (20% opacity)
- **RGBA**: `rgba(107, 130, 104, 0.2)`
- **Usage**: Borders, dividers, subtle separators
- **Example**: Card borders, section dividers

### Medium Accent (30% opacity)
- **RGBA**: `rgba(107, 130, 104, 0.3)`
- **Usage**: More visible borders, shadows
- **Example**: Active borders, box shadows

### Strong Accent (40% opacity)
- **RGBA**: `rgba(107, 130, 104, 0.4)`
- **Usage**: Strong accents, decorative elements
- **Example**: Illustrations, decorative accents

## Gradient Patterns

### Primary Gradient
```css
background: linear-gradient(135deg, #5C7F4F, #5B9378);
```
**Usage**: Primary buttons, hero elements, special emphasis

### Subtle Background Gradient
```css
background: linear-gradient(135deg, #FAF8F5 0%, rgba(107, 130, 104, 0.05) 100%);
```
**Usage**: Card backgrounds, section backgrounds

## Box Shadows

### Standard Shadow
```css
box-shadow: 0 2px 8px rgba(107, 130, 104, 0.3);
```
**Usage**: Buttons, cards, elevated elements

### Hover Shadow
```css
box-shadow: 0 4px 12px rgba(107, 130, 104, 0.4);
```
**Usage**: Hover states for interactive elements

## Implementation Notes

1. **Consistency**: Always use these exact hex/rgba values - no variations
2. **Accessibility**: Ensure sufficient contrast ratios (4.5:1 for text, 3:1 for UI elements)
3. **Gradients**: Use the 135deg angle for consistency
4. **Shadows**: Use rgba with sage green base for cohesive shadows

## Migration Complete

All CSS variables (`var(--color-green-*)`) have been replaced with these standardized values across:
- 58 component files updated
- All buttons, navigation, cards, and interactive elements
- All backgrounds, borders, and shadows
- All text colors and accents

Last updated: 2025-01-21
