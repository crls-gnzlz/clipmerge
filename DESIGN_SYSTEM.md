# Design System - Clipchain

## 2024 Visual Refresh
- **Fondos principales**: blanco puro (`bg-white`) en Home y modales, gris muy suave (`bg-gray-50`, `bg-gray-100`) en botones secundarios, bloques y navegación.
- **Azul solo como acento**: El azul de la paleta `primary` se usa para bordes, iconos, texto destacado y botones principales, pero no como fondo de componentes secundarios.
- **Botones secundarios y modales**: Usan fondo blanco o gris suave, nunca azul. El modal de invitar amigos es blanco, con bordes/acento azul.
- **Navegación**: El estado seleccionado y hover usan fondo gris suave, no azul. El azul queda solo en el texto y el borde.
- **Minimalismo**: El diseño prioriza la neutralidad y limpieza, usando el azul solo para guiar la atención y no saturar la interfaz.

## Design Philosophy
Our design philosophy centers around **clarity**, **elegance**, and **accessibility**. We prioritize:
- **Simplicity over complexity**: Clean, uncluttered interfaces that guide users naturally
- **Consistency over variety**: Unified patterns that create predictable, learnable experiences
- **Accessibility over aesthetics**: Inclusive design that works for everyone
- **Elegance over aggression**: Subtle, refined interactions that feel premium
- **Functionality over decoration**: Every visual element serves a purpose

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` (`primary-600`) - Main brand color, CTAs, links
- **Primary Dark**: `#1d4ed8` (`primary-700`) - Hover states, active elements
- **Primary Light**: `#dbeafe` (`primary-50`) - Backgrounds, subtle highlights

### Secondary Colors
- **Secondary Gray**: `#64748b` (`secondary-600`) - Supporting text, borders
- **Secondary Dark**: `#475569` (`secondary-700`) - Emphasis text
- **Secondary Light**: `#f1f5f9` (`secondary-50`) - Light backgrounds

### Neutral Colors
- **Gray 900**: `#111827` - Primary text, headings
- **Gray 800**: `#1f2937` - Secondary text
- **Gray 600**: `#4b5563` - Body text
- **Gray 400**: `#9ca3af` - Placeholder text
- **Gray 200**: `#e5e7eb` - Borders, dividers
- **Gray 100**: `#f3f4f6` - Light backgrounds
- **Gray 50**: `#f9fafb` - Subtle backgrounds

### Semantic Colors
- **Success**: `#059669` (`green-600`) - Success states, completed items
- **Warning**: `#d97706` (`amber-600`) - Warning states
- **Error**: `#dc2626` (`red-600`) - Error states, destructive actions

## Typography

### Font Weights
- **Light**: `font-light` - Subtle text, descriptions
- **Normal**: `font-normal` - Body text
- **Medium**: `font-medium` - Headings, labels, emphasis
- **Semibold**: `font-semibold` - Strong emphasis (use sparingly)
- **Bold**: `font-bold` - Reserved for critical elements only

### Font Sizes
- **xs**: `text-xs` - Captions, metadata
- **sm**: `text-sm` - Small text, secondary information
- **base**: `text-base` - Body text
- **lg**: `text-lg` - Large text, descriptions
- **xl**: `text-xl` - Section headings
- **2xl**: `text-2xl` - Page titles
- **3xl**: `text-3xl` - Hero titles

### Line Heights
- **Tight**: `leading-tight` - Headings
- **Normal**: `leading-normal` - Body text
- **Relaxed**: `leading-relaxed` - Descriptions, long text

## Component Design Standards

### Cards & Containers
- **Border Radius**: `rounded-2xl` for main containers, `rounded-xl` for cards
- **Shadows**: `shadow-sm` for subtle depth, `shadow-md` for emphasis
- **Borders**: `border-gray-100` for light borders, `border-gray-200` for definition
- **Padding**: `p-8` for main containers, `p-6` for cards, `p-4` for compact elements

### Spacing
- **Section Spacing**: `mb-12` for major sections, `mb-8` for subsections
- **Element Spacing**: `space-y-8` for major elements, `space-y-4` for related items
- **Grid Gaps**: `gap-12` for main columns, `gap-8` for content sections, `gap-4` for items

### Interactive Elements
- **Buttons**: `px-6 py-3` for primary actions, `px-4 py-2` for secondary
- **Links**: `text-primary-600` with `hover:text-primary-700` transitions
- **Focus States**: `focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50`

## Interactive Elements

### Buttons
- **Primary**: `bg-primary-600 hover:bg-primary-700` with white text
- **Secondary**: `bg-white border border-gray-200 hover:bg-gray-50`
- **Text**: `text-primary-600 hover:text-primary-700` with focus rings
- **Transitions**: `transition-all duration-200` for smooth interactions

### Form Elements
- **Inputs**: `border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500`
- **Labels**: `text-sm font-medium text-gray-900` (no uppercase)
- **Validation**: `border-red-300 text-red-600` for errors

### Hover States
- **Cards**: `hover:shadow-md hover:border-gray-200`
- **Links**: `hover:text-primary-700` with smooth transitions
- **Buttons**: `hover:bg-primary-700` with shadow changes

## Responsive Design

### Breakpoints
- **Mobile**: `< 640px` - Stacked layouts, compact spacing
- **Tablet**: `640px - 1024px` - Adjusted grids, medium spacing
- **Desktop**: `> 1024px` - Full layouts, generous spacing

### Grid Systems
- **Mobile**: Single column with `space-y-6`
- **Tablet**: Two columns with `grid-cols-2 gap-6`
- **Desktop**: Multi-column with `grid-cols-2 gap-12`

## Accessibility Standards

### Focus Management
- **Visible Focus**: `focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50`
- **Focus Order**: Logical tab sequence through interactive elements
- **Skip Links**: Hidden until focused for keyboard navigation

### Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Interactive**: Minimum 3:1 contrast ratio
- **Semantic**: Color not the only indicator of information

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Alt Text**: Descriptive alt text for images and icons

## Component States

### Loading States
- **Skeleton**: `animate-pulse bg-gray-200` for content placeholders
- **Spinner**: Centered loading indicators with descriptive text
- **Progressive**: Show partial content as it loads

### Empty States
- **Illustrations**: Relevant icons with helpful descriptions
- **Actions**: Clear next steps or create actions
- **Context**: Explain why the state exists

### Error States
- **Clear Messages**: Human-readable error descriptions
- **Recovery Actions**: Suggested solutions or retry options
- **Visual Indicators**: Consistent error styling

## Implementation Guidelines

### CSS Classes
- **Use Tailwind utilities** for consistent spacing and colors
- **Prefer semantic class names** over arbitrary values
- **Group related styles** in logical order

### Component Structure
- **Consistent naming** for similar components
- **Reusable patterns** for common interactions
- **Clear hierarchy** in component organization

### State Management
- **Predictable state changes** with clear transitions
- **Consistent loading patterns** across components
- **Error boundaries** for graceful failure handling

## Quality Checklist

### Visual Consistency
- [ ] Colors match Design System palette
- [ ] Typography follows established hierarchy
- [ ] Spacing uses consistent scale
- [ ] Shadows and borders are uniform

### Interactive Behavior
- [ ] Hover states provide clear feedback
- [ ] Focus states are visible and accessible
- [ ] Transitions are smooth and purposeful
- [ ] Loading states are informative

### Accessibility
- [ ] Keyboard navigation works properly
- [ ] Screen reader support is adequate
- [ ] Color contrast meets standards
- [ ] Focus management is logical

## Resources

### Design Tokens
- **Colors**: Use Tailwind color classes from our palette
- **Spacing**: Follow 4px base unit system (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **Typography**: Use established font weights and sizes
- **Shadows**: Use consistent shadow scale

### Component Library
- **Base Components**: Button, Input, Card, Modal
- **Layout Components**: Container, Grid, Sidebar
- **Interactive Components**: Dropdown, Tabs, Accordion

---

## ClipChainPlayer Component Reference

### Current State & Design Standards

The `ClipChainPlayer` component represents our **gold standard** for complex interactive components. It demonstrates advanced design patterns that should be replicated across similar components.

#### Visual Design
- **Container**: `rounded-xl` with subtle shadows and borders
- **Player Area**: Clean, minimal interface with focus on content
- **Timeline**: Intuitive visual representation of clip structure
- **Controls**: Contextual, non-intrusive interface elements

#### Interactive Patterns
- **Hover States**: Subtle feedback without overwhelming the interface
- **Focus Management**: Logical tab order through player controls
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Touch Support**: Mobile-optimized touch interactions

#### State Management
- **Loading States**: Smooth transitions between different states
- **Error Handling**: Graceful degradation with helpful messages
- **Progress Indicators**: Clear visual feedback for long operations
- **Context Awareness**: Adapts to different screen sizes and orientations

#### Accessibility Features
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Shortcuts**: Power user features for efficiency
- **High Contrast**: Maintains usability in various lighting conditions
- **Focus Indicators**: Clear visual feedback for keyboard users

#### Responsive Behavior
- **Mobile First**: Optimized for small screens
- **Adaptive Layout**: Adjusts controls and layout for different sizes
- **Touch Friendly**: Appropriate touch targets and gestures
- **Performance**: Smooth animations even on lower-end devices

### Implementation Guidelines for Similar Components

When building components similar to ClipChainPlayer:

1. **Start with accessibility** - Plan keyboard navigation and screen reader support
2. **Design for mobile** - Ensure touch interactions work well
3. **Use consistent patterns** - Follow the established hover, focus, and transition styles
4. **Plan for states** - Loading, error, empty, and success states
5. **Test interactions** - Verify keyboard, mouse, and touch all work properly

### Key Design Principles Demonstrated

- **Progressive Enhancement**: Core functionality works without JavaScript
- **Contextual Controls**: Interface adapts to user's current task
- **Visual Hierarchy**: Clear information architecture and flow
- **Performance**: Smooth interactions without blocking the main thread
- **Accessibility**: Inclusive design that works for everyone

### Interaction Blue (Drop Zones, Badges)
- **Drop Indicator Blue**: `bg-blue-100` + `border-blue-400`
  - Usar para zonas de drop, indicadores de arrastre, badges de "In Chain" y otros elementos interactivos que requieran resaltar la acción de soltar o agrupar.
  - Ejemplo: barra de drop en drag & drop, fondo de badge "In Chain" en tablas.

## Notification & Feedback Popups

### AppNotification (Global Feedback)
- **Posición:** Centrado horizontalmente y en la parte superior (`fixed top-4 left-1/2 transform -translate-x-1/2 z-50`).
- **Animación:** Fade/slide in y out, con cierre automático o manual.
- **Colores y Tipos:**
  - `success`: Verde (`bg-green-50`, `border-green-200`, icono check)
  - `error`: Rojo (`bg-red-50`, `border-red-200`, icono X)
  - `info`: Azul (`bg-blue-50`, `border-blue-200`, icono info)
  - `warning`: Amarillo (`bg-yellow-50`, `border-yellow-200`, icono warning)
- **Iconos:** SVG a la izquierda, color según tipo.
- **Contenido:**
  - `title` (opcional, semibold)
  - `message` (texto principal)
- **Cierre:** Botón de cerrar accesible, o cierre automático tras 2.5s.
- **Uso:**
  - Todos los mensajes de feedback global (éxito, error, warning, info) deben usar este popup.
  - Ejemplo: confirmación de borrado, error de red, invitación copiada, etc.
- **Ejemplo de código:**
```jsx
<AppNotification
  isVisible={isVisible}
  onClose={handleClose}
  type="success" // o "error", "info", "warning"
  title="Deleted"
  message="Clip deleted successfully."
/>
```
- **Consistencia:** No usar popups ad-hoc ni toasts flotantes en otras posiciones. El feedback debe ser siempre claro, centrado y en la parte superior.
