# Design System: Neo-Console 16

## Metadata
- **Display Name:** Neo-Console 16
- **Asset ID:** assets/4e966b1b72894157aeede1e578e087a3

## Theme Configuration

```json
{
  "colorMode": "DARK",
  "font": "SPACE_GROTESK",
  "customColor": "#5d3fd3",
  "headlineFont": "SPACE_GROTESK",
  "bodyFont": "JETBRAINS_MONO",
  "labelFont": "JETBRAINS_MONO",
  "namedColors": {
    "background": "#081425",
    "error": "#ffb4ab",
    "error_container": "#93000a",
    "inverse_on_surface": "#263143",
    "inverse_primary": "#6042d6",
    "inverse_surface": "#d8e3fb",
    "on_background": "#d8e3fb",
    "on_error": "#690005",
    "on_error_container": "#ffdad6",
    "on_primary": "#30009a",
    "on_primary_container": "#d8ceff",
    "on_primary_fixed": "#1c0062",
    "on_primary_fixed_variant": "#4723be",
    "on_secondary": "#00363a",
    "on_secondary_container": "#00686f",
    "on_secondary_fixed": "#002022",
    "on_secondary_fixed_variant": "#004f54",
    "on_surface": "#d8e3fb",
    "on_surface_variant": "#c9c4d7",
    "on_tertiary": "#66002c",
    "on_tertiary_container": "#ffc5d1",
    "on_tertiary_fixed": "#3f0019",
    "on_tertiary_fixed_variant": "#8f0041",
    "outline": "#938ea0",
    "outline_variant": "#484554",
    "primary": "#cabeff",
    "primary_container": "#5d3fd3",
    "primary_fixed": "#e6deff",
    "primary_fixed_dim": "#cabeff",
    "secondary": "#d3fbff",
    "secondary_container": "#00eefc",
    "secondary_fixed": "#7df4ff",
    "secondary_fixed_dim": "#00dbe9",
    "surface": "#081425",
    "surface_bright": "#2f3a4c",
    "surface_container": "#152031",
    "surface_container_high": "#1f2a3c",
    "surface_container_highest": "#2a3548",
    "surface_container_low": "#111c2d",
    "surface_container_lowest": "#040e1f",
    "surface_dim": "#081425",
    "surface_tint": "#cabeff",
    "surface_variant": "#2a3548",
    "tertiary": "#ffb1c3",
    "tertiary_container": "#b60055",
    "tertiary_fixed": "#ffd9e0",
    "tertiary_fixed_dim": "#ffb1c3"
  },
  "typography": {
    "body-md": {
      "fontFamily": "JetBrains Mono",
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "24px"
    },
    "headline-lg": {
      "fontFamily": "Space Grotesk",
      "fontSize": "32px",
      "fontWeight": "700",
      "lineHeight": "36px",
      "letterSpacing": "-0.01em"
    },
    "headline-lg-mobile": {
      "fontFamily": "Space Grotesk",
      "fontSize": "24px",
      "fontWeight": "700",
      "lineHeight": "28px"
    },
    "headline-xl": {
      "fontFamily": "Space Grotesk",
      "fontSize": "48px",
      "fontWeight": "700",
      "lineHeight": "52px",
      "letterSpacing": "-0.02em"
    },
    "label-sm": {
      "fontFamily": "JetBrains Mono",
      "fontSize": "12px",
      "fontWeight": "700",
      "lineHeight": "16px"
    }
  },
  "spacing": {
    "container-max": "1280px",
    "gutter": "16px",
    "margin": "24px",
    "unit": "4px"
  }
}
```

## Brand & Style
This design system captures the nostalgic energy of 16-bit gaming consoles, reimagined through a modern lens. It targets a demographic that appreciates "Neo-Retro" aesthetics—blending the structural constraints of the 90s with the fluid performance of contemporary interfaces. 

The personality is playful yet technical. It utilizes a **Retro-Modern** style that emphasizes structured layouts, high-saturation accents, and tactile UI elements. The emotional goal is to evoke the excitement of a new game loading screen: high-energy, high-contrast, and deeply immersive. We avoid "lo-fi" amateurism in favor of "hi-fidelity" pixel precision, using grid patterns and dithered textures to ground the digital experience in a physical, arcade-inspired reality.

## Colors
The palette is built on a "Deep Slate" base to maintain modern legibility, punctuated by high-chroma "Neon Pixel" accents. 

- **Primary (Hyper-Purple):** Used for main actions and branding. It represents the depth of 16-bit color palettes.
- **Secondary (Cyber-Cyan):** Used for focus states, success indicators, and interactive highlights.
- **Tertiary (Plasma-Pink):** Used for critical alerts, notifications, and "Level Up" moments.
- **Neutral:** A range of Slate Grays (#0F172A to #334155) serves as the "Chassis" of the UI.

To mimic limited hardware palettes, use solid colors without heavy gradients for surfaces, but apply subtle 1px "highlight" lines at the top edge of elements to create a beveled appearance.

## Typography
The typography system pairs the technical precision of **JetBrains Mono** with the geometric, futuristic character of **Space Grotesk**. 

- **Headlines:** Space Grotesk provides a "High-Tech" feel reminiscent of 90s racing game titles. Use tight letter spacing for a compact, impactful look.
- **Body & Data:** JetBrains Mono is the workhorse font. Its monospaced nature mimics the fixed-width character grids of classic consoles while ensuring perfect alignment in data-heavy views.
- **Labels:** Always use uppercase for labels and small buttons to simulate "Start/Select" controller prompts.

## Layout & Spacing
The layout follows a strict **4px baseline grid** to ensure every element snaps to a "pixel-perfect" position. 

- **Grid:** Use a 12-column fluid grid for desktop and a 4-column grid for mobile.
- **Gaps:** Gutters should remain fixed at 16px or 24px to maintain the "panelized" look of early graphical user interfaces.
- **Padding:** Use generous internal padding (16px+) for cards to prevent the UI from feeling cluttered, allowing the bold borders room to breathe.
- **Background Texture:** On large surfaces, apply a subtle 2px x 2px dot pattern or a diagonal scanline overlay at 3% opacity to simulate a CRT monitor.

## Elevation & Depth
In this design system, depth is communicated through **Physical Bevels** rather than soft shadows. 

- **The "Bevel" Rule:** Instead of `box-shadow`, use a 2px solid border. The top and left borders should be a lighter shade of the surface color (highlight), while the bottom and right borders should be a darker shade (lowlight).
- **Stacking:** Elements do not "float." They are "layered" or "socketed." Use inset shadows (`box-shadow: inset ...`) for input fields and troughs to make them appear carved into the UI.
- **Glass:** Use limited backdrop blurs for modal overlays, but keep the edges sharp and framed with a double-line "frame" border.

## Shapes
The shape language is strictly **Sharp (0px)**. 

To mimic the "Double-Frame" aesthetic of 16-bit RPGs, nested elements should have a 1px gap from their parent container's border. All interactive components must maintain 90-degree corners. For a "Retro-Soft" variant on specific buttons, a 2px step-corner (simulating a low-resolution radius) can be used, but standard rounded corners are prohibited.

## Components

### Buttons
Features a "Glossy Bevel." Use a primary color background with a 1px white inner-top border and a 2px black outer-bottom border. On hover, the button should "sink" (shift 1px down and right).

### Cards
Use a "Frame within a Frame" style. A dark slate background with a lighter slate 2px border, and an inner 1px border of the same highlight color.

### Input Fields
Styled as "Socketed" elements. Background is darker than the surrounding surface, with a 2px inset shadow at the top. Use the secondary accent color for the caret.

### Chips/Badges
Use solid high-saturation fills with black text. These should look like "LED indicators" on a machine.

### Checkboxes
Square boxes. When checked, use a pixel-art "X" or a solid block fill in the secondary color.

### Progress Bars
Use "Segmented" fills. Instead of a smooth gradient, the bar should be composed of distinct vertical blocks with 1px gaps between them.
