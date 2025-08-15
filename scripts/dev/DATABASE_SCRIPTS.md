# 🗄️ Scripts de Base de Datos ClipChain

Este documento explica cómo usar los scripts de base de datos tanto en **MongoDB Compass** como en **Node.js con Mongoose**.

## 📋 Scripts Disponibles

### 🚀 Scripts de Node.js (Recomendados)

| Comando | Descripción |
|---------|-------------|
| `npm run db:init` | Inicializa la base de datos (crea índices y estructura) |
| `npm run db:seed` | Pobla la base de datos con datos de ejemplo |
| `npm run db:clear` | Limpia todos los datos (mantiene estructura) |
| `npm run db:clear:all` | Elimina toda la base de datos |
| `npm run db:reset` | Limpia y repuebla la base de datos |
| `npm run db:setup` | Inicializa y pobla la base de datos en un comando |
| `npm run db:test` | Prueba la conexión a MongoDB |

### 🎯 Scripts de MongoDB Compass

| Archivo | Descripción |
|---------|-------------|
| `test-mongodb-script.mongodb` | **Script de prueba** para verificar MongoDB Compass |
| `database-setup.mongodb` | Script completo para MongoDB Compass |
| `database-cleanup.mongodb` | Script de limpieza para MongoDB Compass |

## 🚀 Uso Rápido

### 🧪 **PRIMERO: Probar MongoDB Compass**
```bash
# 1. Abrir MongoDB Compass
# 2. Conectar a tu instancia
# 3. Ejecutar: test-mongodb-script.mongodb
```

### 🚀 Opción 1: Todo en uno (Recomendado)
```bash
npm run db:setup
```

### 📝 Opción 2: Paso a paso
```bash
# 1. Inicializar estructura
npm run db:init

# 2. Poblar con datos
npm run db:seed
```

### 🔄 Opción 3: Reset completo
```bash
npm run db:reset
```

## 📖 Uso Detallado

### 🔧 Inicialización de Base de Datos
```bash
npm run db:init
```
**Qué hace:**
- Conecta a MongoDB
- Crea índices necesarios para performance
- Verifica la estructura de la base de datos
- **NO** incluye datos de ejemplo

### 🌱 Población con Datos de Ejemplo
```bash
npm run db:seed
```
**Qué hace:**
- Crea usuarios de ejemplo (admin, demo, creator)
- Crea clips de ejemplo (React, deportes, música, etc.)
- Crea chains de ejemplo (tutoriales, entretenimiento)
- Actualiza estadísticas de usuarios

### 🗑️ Limpieza de Datos
```bash
# Limpiar solo datos (mantener estructura)
npm run db:clear

# Eliminar toda la base de datos
npm run db:clear:all
```

### 🔄 Reset Completo
```bash
npm run db:reset
```
**Equivale a:**
```bash
npm run db:clear && npm run db:seed
```

## 🎯 Uso en MongoDB Compass

### 🧪 **PASO 1: Probar la Configuración**
1. Abrir MongoDB Compass
2. Conectar a tu instancia de MongoDB
3. **IMPORTANTE**: Ejecutar primero `test-mongodb-script.mongodb`
4. Verificar que funcione correctamente

### 🚀 **PASO 2: Setup Completo**
1. Crear base de datos "clipchain" (si no existe)
2. Abrir MongoDB Shell (mongosh) en Compass
3. Copiar y pegar el contenido de `database-setup.mongodb`
4. Presionar Enter para ejecutar

### 🗑️ **PASO 3: Limpieza (opcional)**
1. Abrir MongoDB Shell (mongosh) en Compass
2. Copiar y pegar el contenido de `database-cleanup.mongodb`
3. Presionar Enter para ejecutar

### ⚠️ **NOTA IMPORTANTE**
- **Siempre** prueba primero con `test-mongodb-script.mongodb`
- Si el script de prueba falla, revisa la configuración de MongoDB Compass
- Los scripts principales solo funcionarán si el de prueba es exitoso

## 📊 Datos de Ejemplo Incluidos

### 👥 Usuarios
- **admin** (admin@clipchain.com / admin123) - Administrador del sistema
- **demo_user** (demo@clipchain.com / demo123) - Usuario de demostración
- **content_creator** (creator@clipchain.com / creator123) - Creador de contenido

### 🎬 Clips
- Tutoriales de React y programación
- Momentos deportivos (fútbol, baloncesto)
- Tutoriales de cocina y música
- Contenido de entretenimiento y comedia

### 🔗 Chains
- Tutorial completo de React
- Compilación de momentos deportivos
- Masterclass de cocina y música
- Mix de entretenimiento y comedia

## ⚠️ Consideraciones Importantes

### 🔐 Contraseñas
- Las contraseñas se hashean con bcrypt antes de guardar
- Factor de costo: 12 (seguro y eficiente)

### 🗂️ Índices
- Se crean automáticamente para optimizar consultas
- Incluyen índices únicos para username y email
- Índices compuestos para búsquedas por tags y categorías

### 🔄 Transacciones
- Los scripts usan operaciones atómicas
- Si falla una parte, se puede reejecutar de forma segura

## 🛠️ Solución de Problemas

### Error de Conexión
```bash
# Verificar configuración
npm run db:test

# Verificar variables de entorno en server/config/config.js
```

### Error de Modelos
```bash
# Verificar que los modelos estén correctamente importados
# Los scripts usan los modelos de server/models/
```

### Error de Permisos
- Verificar que el usuario de MongoDB tenga permisos de escritura
- Verificar que la base de datos "clipchain" exista

## 📝 Personalización

### Agregar Nuevos Usuarios
Editar `server/scripts/seedDatabase.js` en la sección `sampleUsers`

### Agregar Nuevos Clips
Editar `server/scripts/seedDatabase.js` en la sección `sampleClips`

### Agregar Nuevas Chains
Editar `server/scripts/seedDatabase.js` en la sección `sampleChains`

## 🔗 Enlaces Útiles

- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js)

## 📞 Soporte

Si encuentras problemas:
1. Verificar la configuración de MongoDB
2. Revisar los logs de error
3. Verificar que todas las dependencias estén instaladas
4. Ejecutar `npm run db:test` para verificar conexión
