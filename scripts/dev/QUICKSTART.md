# 🚀 ClipChain - Quick Start

Quick guide to get the ClipChain application running with backend and database.

## ⚡ Inicio Rápido (5 minutos)

### 1. 🗄️ Configurar Base de Datos
```bash
# Opción A: MongoDB Local
# Asegúrate de que MongoDB esté ejecutándose en localhost:27017

# Opción B: MongoDB Atlas
# Actualiza MONGODB_URI en tu archivo .env

# Verificar conexión
mongosh mongodb://localhost:27017/clip-merger
```

### 2. 🌱 Poblar Base de Datos
```bash
# Crear datos de ejemplo
npm run db:seed
```

### 3. 🔧 Iniciar Backend
```bash
# Servidor en desarrollo
npm run server:dev
```

### 4. 📱 Iniciar Frontend
```bash
# En otra terminal
npm run dev
```

### 5. 🌐 Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: Conecta con MongoDB Compass o tu cliente preferido

## 🔑 Credenciales de Acceso

Después de ejecutar `npm run db:seed`:

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| admin | admin@clipmerger.com | admin123 | Administrador |
| demo_user | demo@clipmerger.com | demo123 | Usuario Demo |
| content_creator | creator@clipmerger.com | creator123 | Creador |

## 📊 Datos de Ejemplo Creados

- **3 usuarios** con diferentes roles
- **5 clips** de diferentes categorías
- **3 chains** con clips organizados
- **Estadísticas** calculadas automáticamente

## 🧪 Probar la API

### Verificar que funcione
```bash
curl http://localhost:5000/
# Debería devolver: {"message":"🎬 Clip Merger API funcionando correctamente!"}
```

### Crear un usuario de prueba
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

### Obtener clips
```bash
curl http://localhost:5000/api/clips
```

## 🛠️ Comandos Útiles

```bash
# Gestión de base de datos
npm run db:test       # Probar conexión a MongoDB
npm run db:seed       # Poblar con datos de ejemplo

# Servidor
npm run server:dev    # Desarrollo con nodemon
npm run server        # Producción

# Frontend
npm run dev           # Desarrollo
npm run build         # Build de producción
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clip-merger
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
```

### Frontend
Crea un archivo `.env.local` en la raíz:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Estructura de la Aplicación

```
clip-merger/
├── src/                 # Frontend React
│   ├── components/      # Componentes React
│   ├── lib/            # Utilidades y API
│   └── config/         # Configuración
├── server/              # Backend Node.js
│   ├── models/         # Modelos MongoDB
│   ├── controllers/    # Lógica de negocio
│   ├── routes/         # Rutas API
│   └── middleware/     # Middleware personalizado
└── docker-compose.yml   # MongoDB y MongoDB Express
```

## 🚨 Solución de Problemas Comunes

### Error: "Port already in use"
```bash
# Cambiar puerto en .env
PORT=5001
```

### Error: "Cannot connect to MongoDB"
```bash
# Verificar MongoDB local
mongosh mongodb://localhost:27017/clip-merger

# Verificar variables de entorno
echo $MONGODB_URI

# Reiniciar MongoDB local si es necesario
brew services restart mongodb/brew/mongodb-community
```

### Error: "JWT_SECRET not defined"
```bash
# Verificar archivo .env
echo $JWT_SECRET
```

## 🔍 Verificar Funcionamiento

1. **MongoDB**: Conecta con MongoDB Compass a `mongodb://localhost:27017/clip-merger`
2. **Backend**: http://localhost:5000 (mensaje de bienvenida)
3. **Frontend**: http://localhost:3000 (interfaz de usuario)
4. **API**: http://localhost:5000/api/clips (lista de clips)

## 📚 Próximos Pasos

1. **Explorar la API** con MongoDB Express
2. **Crear clips** desde el frontend
3. **Construir chains** con clips existentes
4. **Implementar autenticación** en el frontend
5. **Añadir funcionalidades** como búsqueda y filtros

## 🆘 Necesitas Ayuda?

- Revisa los logs del servidor en la consola
- Verifica la documentación en `server/README.md`
- Comprueba que MongoDB esté ejecutándose localmente o que Atlas esté accesible
- Verifica las variables de entorno en tu archivo `.env`

¡Tu aplicación Clip Merger debería estar funcionando perfectamente! 🎉
