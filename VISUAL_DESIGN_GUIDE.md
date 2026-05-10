# 🎨 NOOL Frontend - Visual Design Guide

## Design System at a Glance

### Color Palette Visualization

```
PRIMARY COLORS (for main actions)
┌─────────────────────────────────────┐
│ #0D6EFD - Primary Blue              │ Used for buttons, links, highlights
│ #E7F1FF - Primary Light             │ Used for backgrounds
│ #0B5ED7 - Primary Dark              │ Hover states
└─────────────────────────────────────┘

STATUS COLORS (semantic meaning)
┌─────────────────────────────────────┐
│ #198754 - Success Green             │ Active, approved, positive
│ #D1E7DD - Success Light             │ Success backgrounds
│ #DC3545 - Danger Red                │ Delete, error, warning
│ #F8D7DA - Danger Light              │ Error backgrounds
│ #FFC107 - Warning Yellow            │ Pending, caution, attention
│ #FFF3CD - Warning Light             │ Warning backgrounds
│ #0DCAF0 - Info Cyan                 │ Information, notes
│ #CFF4FC - Info Light                │ Info backgrounds
└─────────────────────────────────────┘

NEUTRAL COLORS (backgrounds & text)
┌─────────────────────────────────────┐
│ #FFFFFF - White                     │ Primary background
│ #F8F9FA - Light Gray                │ Secondary backgrounds
│ #F0F2F5 - Lighter Gray              │ Hover states
│ #E9ECEF - Gray Border               │ Borders, dividers
│ #6C757D - Gray Text                 │ Secondary text
│ #495057 - Dark Gray                 │ Tertiary text
│ #212529 - Text Dark                 │ Primary text, headings
└─────────────────────────────────────┘
```

---

## Component Visual Examples

### Buttons
```
PRIMARY BUTTON
┌─────────────────────┐
│ ✓ Create Employee   │  Blue background, white text
└─────────────────────┘
Hover: Darker blue
Click: Pressed effect

SECONDARY BUTTON
┌─────────────────────┐
│ Edit                │  Light gray background, dark text
└─────────────────────┘

DANGER BUTTON
┌─────────────────────┐
│ Delete              │  Red background, white text
└─────────────────────┘

OUTLINE BUTTON
┌─────────────────────┐
│ Cancel              │  Blue border, blue text, white bg
└─────────────────────┘
```

### Cards
```
WITH HOVER EFFECT
┌──────────────────────────────┐
│ Card Title                   │
├──────────────────────────────┤
│ Card content goes here       │
│                              │
│ When hovered:                │
│ - Shadow increases           │
│ - Slightly lifts off page    │
└──────────────────────────────┘

WITH PADDING
                lg (24px)
                ↓
        ┌───────────────────┐
     12 │ Content           │ 12px
    px  │                   │ right
        └───────────────────┘
          ↑ 12px left
```

### Input Fields
```
FOCUSED STATE
┌────────────────────────────────────┐
│ Email Address          ✓            │  Green border, no error
└────────────────────────────────────┘

ERROR STATE
┌────────────────────────────────────┐
│ Email Address          ✗            │  Red border
├────────────────────────────────────┤
│ ✗ Invalid email address            │  Red error message
└────────────────────────────────────┘

WITH ICON
┌────────────────────────────────────┐
│ 📧 Email Address                   │  Icon on left
└────────────────────────────────────┘
```

### Badges (Status Indicators)
```
SUCCESS BADGE (Active, Approved)
┌──────────┐
│ ✓ Active │  Green background, dark text
└──────────┘

DANGER BADGE (Inactive, Error)
┌─────────────┐
│ ✗ Inactive  │  Red background, white text
└─────────────┘

WARNING BADGE (Pending)
┌──────────────┐
│ ⏱ Pending    │  Yellow background, dark text
└──────────────┘

LIGHT GRAY BADGE (Neutral)
┌────────────┐
│ Completed  │  Gray background
└────────────┘
```

### Stat Cards (Dashboard Metrics)
```
┌─────────────────────────────────┐
│ 👥 Total Employees      100     │  Icon on right
│                                  │
│ ↑ 5.2% Higher than last month   │  Green trend
└─────────────────────────────────┘
     Color: Primary (Blue)

┌─────────────────────────────────┐
│ 💰 Monthly Revenue      ₹50,000  │
│                                  │
│ ↑ 12% From previous month       │  Green trending up
└─────────────────────────────────┘
     Color: Info (Cyan)
```

### Tables
```
┌──────────────────────────────────────────────────────┐
│ ☐ Name          Email              Status   Actions │
├──────────────────────────────────────────────────────┤
│ ☑ John Doe      john@example.com   ✓ Active Edit   │
│ ☐ Jane Smith    jane@example.com   ✓ Active Edit   │
│ ☐ Bob Wilson    bob@example.com    ✗ Inactive Edit │
├──────────────────────────────────────────────────────┤
│ Showing 1 to 3 of 50   [Previous] [Next]           │
└──────────────────────────────────────────────────────┘

Hover on row: Light gray background
Hover on button: Darker color
```

### Modals
```
┌─────────────────────────────────────┐
│ Create New Employee            [X]  │  Header with close button
├─────────────────────────────────────┤
│                                     │
│ Name: [________________]             │  Form fields
│ Email: [________________]            │  (modal content area)
│ Role: [Select an option ▼]         │
│                                     │
├─────────────────────────────────────┤
│                    [Cancel] [Create]│  Footer with actions
└─────────────────────────────────────┘
```

### Sidebar Navigation
```
LEFT SIDEBAR
┌──────────────────────┐
│ 🎀 NOOL              │  Logo
│ ERP System           │
├──────────────────────┤
│ Logged in as         │  User info
│ ADMIN                │
│ 9876543210           │
├──────────────────────┤
│ 📊 Dashboard         │  Active item (blue bg)
│ 👥 Employees         │  Hover item (light gray)
│ 🧵 Owners            │
│ 📍 Attendance        │
│ 💰 Salary            │
│ 💳 Payments          │
│ 📦 Inventory         │
│ 📝 Daily Work        │
│ 📈 Analytics         │
├──────────────────────┤
│ [Logout]             │  Logout button at bottom
└──────────────────────┘
```

### Top Navbar
```
┌────────────────────────────────────────────┐
│ ☰ Welcome, ADMIN 👋          👤 ADMIN     │
│                                 9876543210 │
└────────────────────────────────────────────┘
```

---

## Spacing System

### Padding (Inside elements)
```
p-0    = 0px      (none)
p-1    = 4px      (minimal)
p-2    = 8px      (extra small)
p-3    = 12px     (small)
p-4    = 16px     (medium) ← Most common
p-6    = 24px     (large)
p-8    = 32px     (extra large)

Applied to all sides: p-4
Horizontal only: px-4
Vertical only: py-4
Top only: pt-4
```

### Margin (Outside elements)
```
m-4 = 16px margin all sides
mx-4 = 16px horizontal margin
my-4 = 16px vertical margin
mb-4 = 16px margin bottom
```

### Gap (Between items)
```
gap-2 = 8px between items
gap-4 = 16px between items ← Most common
gap-6 = 24px between items
```

---

## Typography

### Heading Sizes
```
H1: text-4xl font-bold       │ 36px, bold - Page titles
H2: text-3xl font-bold       │ 30px, bold - Section titles
H3: text-xl font-bold        │ 20px, bold - Card titles
H4: text-lg font-bold        │ 18px, bold - Sub titles
Body: text-base              │ 16px, regular - Main content
Small: text-sm               │ 14px, regular - Secondary info
Tiny: text-xs                │ 12px, regular - Captions
```

### Font Weights
```
100  = font-light       (thin)
300  = font-light       (light)
400  = font-normal      (regular)
500  = font-medium      (medium)
600  = font-semibold    (semi-bold)
700  = font-bold        (bold)
800  = font-extrabold   (extra-bold)
```

---

## Shadow/Elevation System

```
SOFT SHADOW (0 1px 3px)
Used for: Subtle backgrounds, hidden depth
┌─────────────────────┐
│ Subtle shadow ┃     │
└─────────────────────┘

CARD SHADOW (0 2px 8px)
Used for: Cards, containers
┌─────────────────────┐
│ Card content     ┃  │
└─────────────────────┘

HOVER SHADOW (0 4px 12px)
Used for: Hover states, interactive elements
┌─────────────────────┐
│ Lifted effect    ┃┃ │
└─────────────────────┘

ELEVATED SHADOW (0 8px 24px)
Used for: Modals, dropdowns, highest priority
┌─────────────────────┐
│ Modal/highest     ┃┃┃│
└─────────────────────┘
```

---

## Border Radius

```
rounded-sm  = 6px   (subtle)
rounded-lg  = 8px   (standard) ← Most common
rounded-xl  = 12px  (more rounded)
rounded-full = 50%  (pill/circle)

Applied to buttons, cards, inputs, badges
Ensures consistency across UI
```

---

## Responsive Design Breakpoints

```
Mobile (default)    < 768px
                    ┌────────────────────┐
                    │ Full-width content │
                    │ Single column      │
                    │ Stacked buttons    │
                    └────────────────────┘

Tablet (md:)        768px - 1023px
                    ┌─────────┬─────────┐
                    │ Col 1   │ Col 2   │
                    │ 2 items │ per row │
                    └─────────┴─────────┘

Desktop (lg:)       1024px - 1279px
                    ┌───────┬───────┬───────┐
                    │ Col 1 │ Col 2 │ Col 3 │
                    │ 3 items per row       │
                    └───────┴───────┴───────┘

Large (xl:)         1280px+
                    ┌──────┬──────┬──────┬──────┐
                    │ 1    │ 2    │ 3    │ 4    │
                    │ 4 items per row          │
                    └──────┴──────┴──────┴──────┘
```

---

## Animation & Transitions

```
FADE IN
┌─────┐     ┌──────┐     ┌───────┐
│░░░░░│ ──> │░░░░░░│ ──> │███████│
└─────┘     └──────┘     └───────┘
Element gradually appears (opacity 0 to 1)

SLIDE UP
┌───────────┐
│███████████│
├───────────┤  Element slides from bottom
│███████████│  to natural position
└───────────┘

HOVER EFFECT
Before:                After (on hover):
┌───────────┐         ┌───────────┐
│ Card      │ Hover > │ Card      │ (shadow increases)
└───────────┘         └───────────┘
```

---

## Color Usage Guidelines

| Element | Color | When to Use |
|---------|-------|-------------|
| Primary buttons | Primary Blue | Main call-to-action |
| Links | Primary Blue | Navigation, actions |
| Success messages | Success Green | Confirmations, approvals |
| Error messages | Danger Red | Errors, failures |
| Warnings | Warning Yellow | Caution, attention needed |
| Backgrounds | White/Light Gray | Page backgrounds |
| Text | Dark Gray/Text Dark | Body text, headings |
| Borders | Gray Border | Dividers, input borders |
| Hover states | Lighter Gray | Interactive elements |
| Status: Active | Success Green | Active status |
| Status: Inactive | Gray | Inactive status |
| Status: Pending | Warning Yellow | Pending status |
| Status: Error | Danger Red | Error status |

---

## Best Practices

✅ **DO:**
- Use consistent color scheme
- Maintain spacing with Tailwind utilities
- Use semantic colors (green for success, red for danger)
- Test on multiple screen sizes
- Use shadows for depth
- Keep typography hierarchy clear
- Use light backgrounds with dark text
- Add hover effects to interactive elements
- Show loading states during operations

❌ **DON'T:**
- Use random colors
- Mix spacing systems
- Ignore mobile responsiveness
- Use text smaller than 12px
- Add shadows to everything
- Use more than 3 font sizes per page
- Make buttons too small to tap
- Hide important information on mobile
- Use bright, saturated colors

---

## Example Page Layout

```
┌────────────────────────────────────────┐
│ 🎀 NOOL         Welcome, Admin 👋      │  Top Navbar
├─────────┬────────────────────────────────┤
│ 📊 Dashboard                             │
│ 👥 Employees                            │
│ 🧵 Owners      │ Page Title              │  Content Area
│ 📍 Attendance  │ Page Description        │
│ 💰 Salary      │ ┌──────────────────────┤
│ 💳 Payments    │ │ 📊 Stat Card (Blue)  │
│ 📦 Inventory   │ │ 150 Employees        │
│ 📝 Daily Work  │ └──────────────────────┤
│ 📈 Analytics   │ ┌──────────────────────┤
│                │ │ 🎯 Stat Card (Green) │
│ [Logout]       │ │ 45 Present Today     │
│                │ └──────────────────────┤
│                │ ┌──────────────────────┤
│                │ │ Table with data      │
│                │ │ showing employees    │
│                │ └──────────────────────┤
└────────────────┴────────────────────────┘
     Left Sidebar    Right Content Area
     (responsive)    (scales with screen)
```

---

## Quick Reference Checklist

- [ ] All text uses approved fonts (Inter)
- [ ] Colors match the palette exactly
- [ ] Spacing uses 4px base unit
- [ ] Buttons have hover effects
- [ ] Cards have subtle shadows
- [ ] Badges show correct status colors
- [ ] Forms have clear labels and errors
- [ ] Mobile layout is stacked single column
- [ ] Tablet shows 2-column layout
- [ ] Desktop shows 3-4 column layout
- [ ] Loading states are visible
- [ ] Error messages are clear
- [ ] Navigation is accessible
- [ ] Modals have proper overlays
- [ ] Tables are responsive

---

## 🎉 Design System Ready to Use!

Your NOOL ERP frontend follows this design system consistently across all pages and components. Use this guide as reference when building new pages!

