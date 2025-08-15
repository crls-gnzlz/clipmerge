# 🚀 Migración de Docker a MongoDB Local/Atlas

Esta guía te ayudará a migrar desde Docker Compose a una instancia de MongoDB local o MongoDB Atlas.

## 📋 Cambios Realizados

### ✅ Eliminado
- `docker-compose.yml` - Configuración de Docker
- Scripts `npm run db:start` y `npm run db:stop`
- Dependencia de Docker para desarrollo

### ✅ Agregado
- Script `npm run db:test` para probar conexión
- Configuración para MongoDB local y Atlas
- Archivo `.env.example` como plantilla

## 🔧 Configuración Requerida

### 1. Crear archivo `.env`

Copia el contenido de `.env.example` y crea tu archivo `.env`:

```bash
cp .env.example .env
```

O crea manualmente `.env` con:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/clip-merger

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambia_en_produccion

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 2. Opciones de MongoDB

#### Opción A: MongoDB Local
1. Instala MongoDB en tu máquina
2. Asegúrate de que esté ejecutándose en `localhost:27017`
3. Usa `MONGODB_URI=mongodb://localhost:27017/clip-merger`

#### Opción B: MongoDB Atlas
1. Crea una cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un cluster
3. Obtén tu connection string
4. Actualiza `MONGODB_URI` en `.env`

## 🧪 Verificar la Migración

### 1. Probar Conexión
```bash
npm run db:test
```

### 2. Poblar Base de Datos
```bash
npm run db:seed
```

### 3. Iniciar Servidor
```bash
npm run server:dev
```

## 🔍 Solución de Problemas

### Error: "Cannot connect to MongoDB"

#### Para MongoDB Local:
```bash
# Verificar que MongoDB esté ejecutándose
mongosh mongodb://localhost:27017/clip-merger

# En macOS con Homebrew:
brew services list | grep mongodb
brew services restart mongodb/brew/mongodb-community

# En Ubuntu/Debian:
sudo systemctl status mongod
sudo systemctl start mongod
```

#### Para MongoDB Atlas:
1. Verifica tu connection string
2. Asegúrate de que tu IP esté en la whitelist
3. Verifica credenciales de usuario

### Error: "Database not found"
- La base de datos se creará automáticamente cuando ejecutes `npm run db:seed`
- O crea manualmente la base de datos `clip-merger` en MongoDB Compass

## 📚 Comandos Útiles

```bash
# Probar conexión
npm run db:test

# Poblar base de datos
npm run db:seed

# Servidor en desarrollo
npm run server:dev

# Frontend
npm run dev
```

## 🎯 Beneficios de la Migración

1. **Sin dependencias externas** - No necesitas Docker instalado
2. **Más rápido** - Conexión directa a MongoDB
3. **Más flexible** - Puedes usar MongoDB local o Atlas
4. **Mejor para producción** - Configuración más estándar
5. **Fácil debugging** - Conecta directamente con MongoDB Compass

## 🔄 Revertir Cambios (si es necesario)

Si necesitas volver a Docker:

1. Restaura `docker-compose.yml` desde git
2. Restaura los scripts en `package.json`
3. Ejecuta `npm run db:start`

---

¡Tu proyecto ahora funciona sin Docker! 🎉
