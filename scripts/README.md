# ClipChain Scripts

Este directorio contiene scripts organizados para diferentes propósitos del proyecto ClipChain.

## 📁 Estructura de Carpetas

```
scripts/
├── launch/          # Scripts de lanzamiento de la aplicación
├── setup/           # Scripts de configuración inicial
├── database/        # Scripts de base de datos
├── maintenance/     # Scripts de mantenimiento
└── tools/           # Herramientas adicionales
```

## 🚀 Scripts de Lanzamiento (`launch/`)

### `start-app.sh` - Lanzamiento Principal
Script completo con verificaciones previas, manejo de errores y logging detallado.

**Uso:**
```bash
./scripts/launch/start-app.sh
```

**Características:**
- ✅ Verifica dependencias (Node.js, npm, MongoDB)
- ✅ Limpia puertos automáticamente
- ✅ Verifica estado de la base de datos
- ✅ Manejo robusto de errores
- ✅ Logging colorido y detallado
- ✅ Limpieza automática al salir

### `dev.sh` - Modo Desarrollo
Script optimizado para desarrollo diario con verificaciones básicas.

**Uso:**
```bash
./scripts/launch/dev.sh
```

**Características:**
- ✅ Limpieza rápida de puertos
- ✅ Inicio de backend y frontend
- ✅ Verificación básica del backend
- ✅ Limpieza automática al salir

### `quick-start.sh` - Inicio Rápido
Script más simple para desarrollo rápido sin verificaciones extensas.

**Uso:**
```bash
./scripts/launch/quick-start.sh
```

**Características:**
- ✅ Inicio más rápido
- ✅ Menos verificaciones
- ✅ Ideal para desarrollo iterativo

## ⚙️ Scripts de Configuración (`setup/`)

### `setup-database.sh` - Configuración de Base de Datos
Configura MongoDB y la base de datos inicial del proyecto.

**Uso:**
```bash
./scripts/setup/setup-database.sh
```

**Características:**
- ✅ Verifica instalación de MongoDB
- ✅ Inicia MongoDB si es necesario
- ✅ Inicializa la base de datos
- ✅ Sembra datos de ejemplo
- ✅ Prueba la conexión

## 🧹 Scripts de Mantenimiento (`maintenance/`)

### `cleanup.sh` - Limpieza del Sistema
Limpia procesos, puertos, logs y archivos temporales.

**Uso:**
```bash
./scripts/maintenance/cleanup.sh
```

**Características:**
- ✅ Limpia procesos de ClipChain
- ✅ Libera puertos ocupados
- ✅ Limpia logs antiguos
- ✅ Gestiona node_modules
- ✅ Muestra estado del sistema

## 📊 Scripts de Base de Datos (`database/`)

Los scripts de base de datos se ejecutan a través de npm:

```bash
# Inicializar base de datos
npm run db:init

# Sembrar datos de ejemplo
npm run db:seed

# Probar conexión
npm run db:test

# Limpiar base de datos
npm run db:clear

# Reset completo
npm run db:reset
```

## 🎯 Casos de Uso Recomendados

### 🆕 Primera vez / Configuración inicial
```bash
# 1. Configurar base de datos
./scripts/setup/setup-database.sh

# 2. Lanzar aplicación completa
./scripts/launch/start-app.sh
```

### 🔄 Desarrollo diario
```bash
# Opción 1: Desarrollo con verificaciones
./scripts/launch/dev.sh

# Opción 2: Desarrollo rápido
./scripts/launch/quick-start.sh
```

### 🧹 Mantenimiento / Limpieza
```bash
# Limpiar sistema
./scripts/maintenance/cleanup.sh
```

### 🚨 Solución de problemas
```bash
# 1. Limpiar todo
./scripts/maintenance/cleanup.sh

# 2. Reconfigurar base de datos
./scripts/setup/setup-database.sh

# 3. Lanzar con verificaciones completas
./scripts/launch/start-app.sh
```

## ⚠️ Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **MongoDB** (instalado y ejecutándose)
- **Bash** (para scripts de Unix/macOS)
- **curl** (para verificaciones de conectividad)

## 🔧 Personalización

Los scripts están diseñados para ser modulares. Puedes:

1. **Modificar puertos** en `scripts/launch/start-app.sh`
2. **Ajustar timeouts** según tu sistema
3. **Agregar verificaciones** específicas para tu entorno
4. **Personalizar colores** y mensajes

## 🐛 Solución de Problemas

### Error: "Permission denied"
```bash
chmod +x scripts/launch/*.sh
```

### Error: "No se encontró package.json"
Asegúrate de estar en el directorio raíz del proyecto ClipChain.

### Error: "Puerto ya en uso"
Los scripts limpian automáticamente los puertos, pero si persiste:
```bash
./scripts/maintenance/cleanup.sh
```

### Error: "MongoDB no está ejecutándose"
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

## 📝 Logs y Debugging

Los scripts principales incluyen logging detallado:
- **Azul**: Información general
- **Verde**: Éxito
- **Amarillo**: Advertencias
- **Rojo**: Errores

Para debugging adicional, revisa:
- Consola del navegador (frontend)
- Terminal del servidor (backend)
- Logs de MongoDB (`/tmp/mongod.log`)

## 🤝 Contribución

Al modificar los scripts:
1. Mantén la consistencia en el estilo
2. Agrega comentarios explicativos
3. Prueba en diferentes entornos
4. Actualiza esta documentación

