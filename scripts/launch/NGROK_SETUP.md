# Configuración de ngrok para Clip Merger

Esta configuración permite acceder a tu aplicación Clip Merger desde internet usando ngrok, creando túneles seguros para el frontend y backend.

## 📋 Prerrequisitos

1. **ngrok instalado**: Descarga desde [ngrok.com/download](https://ngrok.com/download)
2. **Auth Token configurado**: 
   - Copia `ngrok.yml.example` a `ngrok.yml`
   - Reemplaza `YOUR_NGROK_AUTH_TOKEN_HERE` con tu token real
   - Obtén tu token en [ngrok.com/dashboard](https://ngrok.com/dashboard)

## ⚙️ Configuración inicial

### 1. Crear archivo de configuración
```bash
# Copiar el archivo de ejemplo
cp ngrok.yml.example ngrok.yml

# Editar y agregar tu auth token
nano ngrok.yml  # o usar tu editor preferido
```

### 2. Obtener tu auth token
1. Ve a [ngrok.com/dashboard](https://ngrok.com/dashboard)
2. Inicia sesión o crea una cuenta
3. Ve a "Your Authtoken"
4. Copia el token y reemplázalo en `ngrok.yml`

### 3. Verificar configuración
```bash
# Probar la configuración
ngrok config check
```

## 🚀 Opciones de inicio

### Opción 1: Solo ngrok (túneles)
```bash
# Desde la raíz del proyecto
./scripts/launch/start-ngrok-all.sh

# O en Windows PowerShell
./scripts/launch/start-ngrok-all.ps1
```

### Opción 2: Aplicación completa + ngrok
```bash
# Desde la raíz del proyecto
./scripts/launch/start-app-with-ngrok.sh
```

### Opción 3: Manual
```bash
# Iniciar solo ngrok
ngrok start --all --config ngrok.yml

# O iniciar túneles individuales
ngrok start frontend --config ngrok.yml
ngrok start backend --config ngrok.yml
```

## 🌐 URLs de acceso

Una vez iniciado, tendrás acceso a:

- **Frontend**: `http://localhost:5173` (local) + URL pública de ngrok
- **Backend**: `http://localhost:9000` (local) + URL pública de ngrok
- **Dashboard ngrok**: `http://localhost:4040`

## 📁 Archivos de configuración

### ngrok.yml
```yaml
version: "2"
authtoken: 30zxt2ukNpn3HyIHChs9cRlVJ87_4a5T8Gc8LtS5Hh8qM9sxR
tunnels:
  frontend:
    addr: 5173
    proto: http
    inspect: true
  backend:
    addr: 9000
    proto: http
    inspect: true
```

## 🔧 Personalización

### Cambiar puertos
Si cambias los puertos en tu aplicación, actualiza `ngrok.yml`:

```yaml
tunnels:
  frontend:
    addr: [NUEVO_PUERTO_FRONTEND]
    proto: http
  backend:
    addr: [NUEVO_PUERTO_BACKEND]
    proto: http
```

### Agregar más túneles
```yaml
tunnels:
  frontend:
    addr: 5173
    proto: http
  backend:
    addr: 9000
    proto: http
  database:
    addr: 27017
    proto: tcp
```

## 🛑 Detener servicios

- **Ctrl+C**: Detiene todos los servicios si usas `start-app-with-ngrok.sh`
- **ngrok dashboard**: Ve a `http://localhost:4040` y usa el botón "Stop"

## 🔍 Troubleshooting

### Error: CORS Policy
Si ves errores de CORS como:
```
Access to fetch at 'http://localhost:9000/api/users/login' from origin 'https://tu-dominio.ngrok-free.app' has been blocked by CORS policy
```

**Solución:**
1. **Reiniciar servidor con nueva configuración CORS:**
   ```bash
   ./scripts/launch/restart-server-cors.sh
   ```

2. **Verificar configuración CORS:**
   - El servidor ahora permite automáticamente cualquier dominio de ngrok
   - Los logs mostrarán qué dominios están siendo permitidos

3. **Testear CORS:**
   - Abre `scripts/tools/test-cors.html` en tu navegador
   - Actualiza la URL del backend si usas ngrok
   - Ejecuta los tests para verificar que CORS funcione

### Error: "ngrok not found"
```bash
# Instalar ngrok
# macOS
brew install ngrok/ngrok/ngrok

# Windows
# Descargar desde ngrok.com/download

# Linux
snap install ngrok
```

### Error: "Auth token invalid"
```bash
# Reconfigurar token
ngrok config add-authtoken [TU_NUEVO_TOKEN]
```

### Puerto ya en uso
```bash
# Verificar qué está usando el puerto
lsof -i :5173
lsof -i :9000

# Detener proceso
kill -9 [PID]
```

## 📱 Uso en dispositivos móviles

Una vez que ngrok esté corriendo, podrás acceder a tu aplicación desde cualquier dispositivo usando las URLs públicas que ngrok genera.

## 🔒 Seguridad

- Los túneles de ngrok son públicos por defecto
- Para desarrollo local, esto es aceptable
- Para producción, considera usar ngrok Pro con autenticación
