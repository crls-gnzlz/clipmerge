# Mock Data Testing Guide

Este documento explica cómo usar el mock data para probar la funcionalidad de CreateChain sin necesidad de una API real.

## 🎯 Propósito

El mock data permite probar completamente la funcionalidad de:
- ✅ Selección de clips
- ✅ Drag & drop para reordenar
- ✅ Filtros y búsqueda
- ✅ Validación de formularios
- ✅ Flujo completo de creación de chains

## 🚀 Cómo Usar

### 1. **Acceder a CreateChain**
- Navega a `/create-chain` en la aplicación
- El mock data está habilitado por defecto

### 2. **Toggle de Mock Data**
- En la parte superior de la página verás un checkbox "Use mock data for testing"
- Cuando está activo, verás un badge azul "Mock Mode Active"

### 3. **Probar la Funcionalidad**
- Haz clic en "+ Add Clips" para abrir el selector
- Verás 10 clips de ejemplo con diferentes temas y duraciones
- Usa la búsqueda y filtros por tags
- Selecciona múltiples clips
- Prueba el drag & drop en la sección de clips seleccionados

## 📊 Datos de Ejemplo Incluidos

### **Clips Disponibles:**
1. **Introduction to React Hooks** (3 min) - react, hooks, tutorial, frontend
2. **Advanced TypeScript Patterns** (4 min) - typescript, advanced, patterns, types
3. **CSS Grid Layout Mastery** (5 min) - css, grid, layout, responsive
4. **Node.js Performance Optimization** (6 min) - nodejs, performance, optimization, backend
5. **MongoDB Aggregation Pipeline** (7 min) - mongodb, aggregation, database, queries
6. **Docker Containerization Best Practices** (5 min) - docker, containers, devops, deployment
7. **Git Workflow Strategies** (4 min) - git, workflow, version-control, collaboration
8. **API Design Principles** (6 min) - api, rest, design, authentication
9. **Testing with Jest and React Testing Library** (8 min) - testing, jest, react-testing-library, unit-tests
10. **State Management with Redux Toolkit** (9 min) - redux, state-management, toolkit, react

### **Características de los Datos:**
- **Títulos realistas** con descripciones detalladas
- **Duración variada** de 3 a 9 minutos
- **Tags relevantes** para cada tema
- **Fechas de creación** ordenadas cronológicamente
- **Datos consistentes** con la estructura de la aplicación

## 🔧 Funcionalidades a Probar

### **Selector de Clips:**
- ✅ **Búsqueda**: Escribe en el campo de búsqueda
- ✅ **Filtros por Tags**: Haz clic en los tags para filtrar
- ✅ **Selección múltiple**: Marca varios clips con checkboxes
- ✅ **Contador**: Ve cuántos clips has seleccionado
- ✅ **Botón de añadir**: Aparece solo cuando hay clips seleccionados

### **Drag & Drop:**
- ✅ **Reordenamiento**: Arrastra clips para cambiar el orden
- ✅ **Feedback visual**: Estados de hover, drag y drop
- ✅ **Indicadores de orden**: Números que muestran la posición
- ✅ **Remove buttons**: Elimina clips individuales
- ✅ **Estados vacíos**: Mensaje cuando no hay clips

### **Validación:**
- ✅ **Nombre requerido**: No puedes crear chain sin nombre
- ✅ **Clips requeridos**: Debes añadir al menos un clip
- ✅ **Mensajes de error**: Feedback claro sobre errores
- ✅ **Estados de loading**: Simulación de creación

## 🎨 Características del Mock Data

### **Ordenamiento Inteligente:**
- Los clips se muestran por fecha de creación (más recientes primero)
- Los clips ya añadidos a la chain no aparecen en el selector
- Filtrado automático de duplicados

### **Búsqueda Avanzada:**
- Búsqueda por título y descripción
- Filtros por tags individuales o múltiples
- Resultados en tiempo real

### **Simulación de API:**
- Loading states realistas (500ms)
- Simulación de creación (1000ms)
- Fallback automático si la API falla
- Logs en consola para debugging

## 🚨 Limitaciones del Mock Data

### **No Persistente:**
- Los datos se resetean al recargar la página
- No hay sincronización entre sesiones
- Los cambios no se guardan en base de datos

### **Funcionalidad Limitada:**
- No hay autenticación real
- No hay permisos o roles
- No hay colaboración entre usuarios

### **Datos Estáticos:**
- Los clips son siempre los mismos
- No hay creación dinámica de clips
- Los tags están predefinidos

## 🔄 Cambiar Entre Mock y API Real

### **Para Usar Mock Data:**
```jsx
// En CreateChain.jsx
const [useMockData, setUseMockData] = useState(true);
```

### **Para Usar API Real:**
```jsx
// En CreateChain.jsx
const [useMockData, setUseMockData] = useState(false);
```

### **Toggle Dinámico:**
- Usa el checkbox en la interfaz
- Cambia en tiempo real
- No requiere recargar la página

## 📝 Ejemplos de Uso

### **Probar Búsqueda:**
1. Abre el selector de clips
2. Escribe "React" en la búsqueda
3. Verás clips relacionados con React
4. Prueba con otros términos: "testing", "performance", etc.

### **Probar Filtros por Tags:**
1. Haz clic en el tag "frontend"
2. Verás solo clips relacionados con frontend
3. Combina múltiples tags
4. Limpia los filtros para ver todos los clips

### **Probar Drag & Drop:**
1. Añade varios clips a la chain
2. Arrastra el primer clip al final
3. Verifica que los números de orden cambien
4. Prueba reordenar clips del medio

### **Probar Validación:**
1. Intenta crear una chain sin nombre
2. Intenta crear una chain sin clips
3. Verifica que aparezcan mensajes de error
4. Completa el formulario y verifica que funcione

## 🎯 Casos de Prueba Recomendados

### **Flujo Completo:**
1. Crear chain con nombre y descripción
2. Añadir 3-5 clips diferentes
3. Reordenar clips usando drag & drop
4. Añadir tags relevantes
5. Crear la chain exitosamente

### **Casos Edge:**
1. Crear chain con solo un clip
2. Crear chain con máximo de clips
3. Probar búsqueda con términos inexistentes
4. Probar filtros con tags sin resultados

### **Validación:**
1. Formulario vacío
2. Solo nombre sin clips
3. Solo clips sin nombre
4. Tags duplicados
5. Nombre muy largo

## 🔍 Debugging

### **Console Logs:**
- Los datos de creación se muestran en la consola
- Errores de API se registran automáticamente
- Fallback a mock data se indica claramente

### **Estados Visuales:**
- Loading states son claros
- Estados de error son visibles
- Feedback de éxito es obvio

### **Network Tab:**
- Con mock data: No hay llamadas de red
- Con API real: Verás las llamadas HTTP
- Fallbacks se manejan automáticamente

---

## 🎉 Resumen

El mock data proporciona una experiencia completa de testing sin necesidad de configuración de backend. Permite probar todas las funcionalidades de CreateChain de manera aislada y controlada.

**Beneficios:**
- ✅ Testing rápido y confiable
- ✅ No depende de servicios externos
- ✅ Datos consistentes y predecibles
- ✅ Fácil debugging y desarrollo
- ✅ Experiencia de usuario completa

**Uso recomendado:**
- **Desarrollo**: Usar mock data para iteración rápida
- **Testing**: Verificar funcionalidad sin dependencias
- **Demo**: Mostrar la aplicación a stakeholders
- **QA**: Probar casos edge y flujos completos
