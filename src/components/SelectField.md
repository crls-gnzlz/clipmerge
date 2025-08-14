# SelectField Component

Un componente de selector elegante y reutilizable que mantiene la consistencia visual de la app.

## 🎯 Características

- **Diseño elegante**: Consistente con el sistema de diseño de la app
- **Accesibilidad completa**: Navegación por teclado, ARIA labels, screen reader support
- **Personalizable**: Múltiples tamaños, variantes y opciones de estilo
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Interactivo**: Hover states, focus states, y transiciones suaves

## 📦 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Etiqueta del campo (opcional) |
| `value` | `string` | `undefined` | Valor seleccionado actualmente |
| `onChange` | `function` | `required` | Función llamada cuando cambia la selección |
| `options` | `array` | `[]` | Array de opciones disponibles |
| `placeholder` | `string` | `"Select an option"` | Texto mostrado cuando no hay selección |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `error` | `string` | `null` | Mensaje de error a mostrar |
| `className` | `string` | `""` | Clases CSS adicionales |
| `size` | `string` | `"default"` | Tamaño del campo (`"small"`, `"default"`, `"large"`) |
| `variant` | `string` | `"default"` | Variante de estilo (`"default"`, `"outlined"`, `"filled"`) |

## 🎨 Opciones de Estilo

### Tamaños
- **`small`**: `px-3 py-2 text-xs` - Para formularios compactos
- **`default`**: `px-4 py-2.5 text-sm` - Tamaño estándar
- **`large`**: `px-5 py-3 text-base` - Para formularios prominentes

### Variantes
- **`default`**: Fondo blanco con bordes grises
- **`outlined`**: Transparente con bordes más definidos
- **`filled`**: Fondo gris suave con hover states

## 📝 Estructura de Opciones

Cada opción debe tener esta estructura:

```javascript
{
  value: 'unique-value',
  label: 'Display Text',
  description: 'Optional description' // Opcional
}
```

## ⌨️ Navegación por Teclado

- **↑/↓**: Navegar entre opciones
- **Enter**: Seleccionar opción resaltada
- **Escape**: Cerrar dropdown
- **Tab**: Navegación normal del formulario

## 🚀 Ejemplos de Uso

### Uso Básico
```jsx
import SelectField from '../components/SelectField';

<SelectField
  label="Status"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
/>
```

### Con Descripciones
```jsx
<SelectField
  label="User Role"
  value={role}
  onChange={setRole}
  options={[
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Full access to all features'
    },
    {
      value: 'user',
      label: 'Regular User',
      description: 'Limited access to basic features'
    }
  ]}
  placeholder="Select user role"
/>
```

### Con Estilo Personalizado
```jsx
<SelectField
  label="Theme"
  value={theme}
  onChange={setTheme}
  options={themeOptions}
  size="large"
  variant="filled"
  className="max-w-md"
/>
```

### Con Estado de Error
```jsx
<SelectField
  label="Category"
  value={category}
  onChange={setCategory}
  options={categoryOptions}
  error="Please select a category"
/>
```

## 🎨 Estados Visuales

- **Normal**: Borde gris, fondo según variante
- **Hover**: Borde más oscuro, hover states en opciones
- **Focus**: Ring azul (primary-500), borde azul
- **Error**: Borde rojo, focus rojo
- **Disabled**: Opacidad reducida, cursor not-allowed
- **Open**: Ring azul con opacidad reducida

## ♿ Accesibilidad

- **ARIA labels**: `aria-haspopup`, `aria-expanded`, `aria-selected`
- **Roles**: `listbox`, `option`
- **Navegación por teclado**: Flechas, Enter, Escape
- **Screen readers**: Labels descriptivos y estados claros
- **Focus management**: Focus visible y manejado correctamente

## 🔧 Personalización

El componente usa las clases de Tailwind CSS de la app:
- **Colores primarios**: `primary-50`, `primary-100`, `primary-500`, `primary-600`, `primary-700`
- **Colores de error**: `red-300`, `red-500`
- **Transiciones**: `transition-all duration-200`

## 📱 Responsive

- **Mobile**: Dropdown de ancho completo
- **Desktop**: Dropdown con scroll si hay muchas opciones
- **Max height**: `max-h-60` para evitar que el dropdown sea muy alto

## 🎯 Casos de Uso Ideales

- **Formularios**: Selección de categorías, estados, roles
- **Configuración**: Temas, idiomas, preferencias
- **Filtros**: Ordenamiento, agrupación, clasificación
- **Navegación**: Menús desplegables, breadcrumbs
