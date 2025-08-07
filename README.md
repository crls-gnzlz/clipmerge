# clipMerge

Una aplicación web que permite a los usuarios guardar y reproducir clips de vídeo seleccionando intervalos de tiempo dentro de vídeos y agrupándolos en colecciones compartibles.

## Tecnologías

- **React** con Vite
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **JavaScript** (no TypeScript)

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Header.jsx      # Header con navegación
├── pages/              # Vistas principales
│   └── Home.jsx        # Página de inicio
├── lib/                # Lógica auxiliar
│   └── urlParser.js    # Utilidades para parsear URLs
├── data/               # Datos mockeados
│   └── mockData.js     # Datos de ejemplo
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## Características

- ✅ Navegación con React Router
- ✅ Diseño responsive con Tailwind CSS
- ✅ Estructura escalable de carpetas
- ✅ Componentes reutilizables
- ✅ Utilidades para parsear URLs de YouTube
- ✅ Datos mockeados para desarrollo

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Próximas Funcionalidades

- [ ] Creación de clips con selección de tiempo
- [ ] Gestión de colecciones
- [ ] Reproducción de clips
- [ ] Sistema de usuarios
- [ ] Compartir colecciones
