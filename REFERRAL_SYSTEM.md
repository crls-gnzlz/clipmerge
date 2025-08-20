# Sistema de Referidos - Clip Merger

## 📋 Descripción

El sistema de referidos permite a los usuarios compartir enlaces únicos para invitar amigos a la plataforma. Cada usuario tiene un identificador único de 8 caracteres que se usa para rastrear referidos y estadísticas.

## 🏗️ Arquitectura

### Backend

#### Modelo User (MongoDB)
```javascript
// Nuevos campos agregados
referralId: {
  type: String,
  unique: true,
  sparse: true,
  index: true
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  sparse: true
},

referralStats: {
  totalReferrals: {
    type: Number,
    default: 0
  },
  successfulReferrals: {
    type: Number,
    default: 0
  }
}
```

#### Controlador de Usuarios
- `getReferralLink()` - Obtiene o genera el enlace de referidos del usuario
- `getReferralStats()` - Obtiene estadísticas de referidos
- `findUserByReferralId()` - Busca usuario por ID de referido (público)

#### Rutas API
- `GET /api/users/referral-link` - Obtener enlace de referidos (autenticado)
- `GET /api/users/referral-stats` - Obtener estadísticas (autenticado)
- `GET /api/users/referral/:referralId` - Buscar usuario por referral ID (público)

### Frontend

#### Sidebar Component
- Muestra el enlace de referidos del usuario
- Estadísticas de referidos (total y exitosos)
- Botón para copiar el enlace
- Estado de carga mientras se obtiene el enlace

#### API Service
- `getReferralLink()` - Obtiene el enlace de referidos
- `getReferralStats()` - Obtiene estadísticas

## 🚀 Funcionalidades

### 1. Generación Automática de Referral IDs
- Cada usuario recibe un ID único de 8 caracteres alfanuméricos
- Se genera automáticamente al crear la cuenta o al acceder por primera vez
- Verificación de unicidad en la base de datos

### 2. Enlaces de Referidos
- Formato: `https://clipchain.app/ref/ABC12345`
- Enlaces únicos por usuario
- Fácil de compartir y recordar

### 3. Estadísticas de Referidos
- Total de referidos generados
- Referidos exitosos (usuarios que se registraron)
- Actualización en tiempo real

### 4. Interfaz de Usuario
- Enlace clickeable en el sidebar
- Botón de copia con notificación
- Estadísticas visuales
- Estado de carga

## 🔧 Instalación y Configuración

### 1. Migración de Base de Datos
```bash
# Ejecutar migración para usuarios existentes
npm run db:referral-migration
```

### 2. Verificar Configuración
- Asegurarse de que el modelo User tenga los nuevos campos
- Verificar que las rutas estén configuradas
- Comprobar que el frontend esté usando el nuevo API service

### 3. Reiniciar Servidor
```bash
# Reiniciar el servidor para aplicar cambios
npm run server:dev
```

## 📊 Uso del Sistema

### Para Usuarios
1. **Acceder al Sidebar**: El enlace de referidos aparece en la sección "Invite Friends"
2. **Copiar Enlace**: Hacer clic en el botón "Copy" para copiar al portapapeles
3. **Compartir**: Enviar el enlace a amigos por cualquier medio
4. **Ver Estadísticas**: Las estadísticas se muestran debajo del enlace

### Para Desarrolladores
1. **API Endpoints**: Usar las nuevas rutas para obtener datos de referidos
2. **Modelo de Datos**: Los nuevos campos están disponibles en el modelo User
3. **Frontend Integration**: El componente Sidebar ya está integrado

## 🔍 Monitoreo y Debugging

### Logs del Servidor
- Generación de referral IDs
- Errores en la creación de enlaces
- Estadísticas de uso

### Base de Datos
- Campo `referralId` en colección `users`
- Índices para búsquedas eficientes
- Estadísticas de referidos por usuario

## 🚧 Futuras Mejoras

### 1. Sistema de Recompensas
- Puntos por referidos exitosos
- Badges y logros
- Sistema de niveles

### 2. Analytics Avanzados
- Tracking de clicks en enlaces
- Conversión de referidos
- Métricas de engagement

### 3. Campañas de Referidos
- Enlaces temporales
- Códigos promocionales
- A/B testing de enlaces

### 4. Integración Social
- Compartir en redes sociales
- Widgets para sitios web
- API para desarrolladores externos

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Referral ID no se genera
```bash
# Verificar que el usuario esté autenticado
# Revisar logs del servidor
# Ejecutar migración manual si es necesario
npm run db:referral-migration
```

#### 2. Error de duplicación
```bash
# Verificar índices únicos en MongoDB
# Limpiar IDs duplicados si es necesario
```

#### 3. Frontend no muestra enlace
```bash
# Verificar que el API esté funcionando
# Comprobar estado de autenticación
# Revisar consola del navegador
```

### Comandos Útiles
```bash
# Ver estado de la base de datos
npm run db:test

# Ejecutar migración de referidos
npm run db:referral-migration

# Reiniciar servidor
npm run server:dev
```

## 📝 Notas de Implementación

### Seguridad
- Los referral IDs son públicos pero no revelan información sensible
- Solo usuarios autenticados pueden ver sus propias estadísticas
- Validación de entrada en todas las rutas

### Performance
- Índices en MongoDB para búsquedas eficientes
- Caché de enlaces en el frontend
- Lazy loading de estadísticas

### Escalabilidad
- IDs únicos de 8 caracteres permiten millones de usuarios
- Sistema de reintentos para generación de IDs
- Estructura preparada para futuras funcionalidades

## 🤝 Contribución

Para contribuir al sistema de referidos:

1. Crear una rama para tu feature
2. Implementar cambios siguiendo la arquitectura existente
3. Agregar tests si es necesario
4. Documentar nuevas funcionalidades
5. Crear un pull request

## 📞 Soporte

Si encuentras problemas con el sistema de referidos:

1. Revisar los logs del servidor
2. Verificar la configuración de la base de datos
3. Comprobar que todas las dependencias estén instaladas
4. Crear un issue en el repositorio con detalles del problema
