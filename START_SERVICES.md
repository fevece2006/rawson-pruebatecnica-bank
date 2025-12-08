# Guía de Inicio de Servicios

## Servicios Requeridos

### 1. Docker Services (Backend + Keycloak)
```bash
cd d:\Rawson-pruebatecnica-proyecto-bank\rawson-pruebatecnica-bank
docker-compose up -d
```

**Servicios incluidos:**
- ✅ Keycloak (puerto 8080)
- ✅ PostgreSQL
- ✅ Kafka + Zookeeper
- ✅ Backend Bank System (puerto 8083)
- ✅ Ledger Service (puerto 8081)
- ✅ Orchestrator Service (puerto 8082)
- ✅ API Gateway (puerto 8085)
- ✅ Service Registry (puerto 8761)

### 2. Frontend React
```bash
cd d:\Rawson-pruebatecnica-proyecto-bank\rawson-pruebatecnica-bank\frontend-bank-system
npm start
```

El frontend se abrirá automáticamente en **http://localhost:3000/**

## Verificar que todo funciona

### URLs de Acceso:

1. **Aplicación Frontend**: http://localhost:3000/
   - Al abrir esta URL, serás redirigido automáticamente al login de Keycloak
   - Después de autenticarte, volverás a la aplicación
   
2. **Keycloak Admin Console**: http://localhost:8080/
   - Click en "Administration Console"
   - Usuario: `admin` / Contraseña: `admin`

3. **Service Registry (Eureka)**: http://localhost:8761/

4. **Kafka UI**: http://localhost:8090/

### Usuarios de Prueba:

- **admin** / **admin** (rol: admin)
- **user** / **user** (rol: user)
- **testuser** / **test123** (rol: user)

## Comandos Útiles

### Verificar servicios Docker:
```bash
docker-compose ps
```

### Ver logs de un servicio:
```bash
docker logs keycloak-bank
docker logs backend-bank-system
```

### Detener todos los servicios:
```bash
docker-compose down
```

### Reiniciar un servicio específico:
```bash
docker-compose restart keycloak
```

## Troubleshooting

### Si Keycloak no inicia:
```bash
docker logs keycloak-bank --tail 50
```

### Si el frontend no se conecta a Keycloak:
1. Verificar que Keycloak esté corriendo: `docker ps | findstr keycloak`
2. Verificar configuración del cliente en Keycloak Admin Console
3. Limpiar cache del navegador (Ctrl+Shift+R)

### Si hay problemas con el puerto 3000:
```bash
# Detener proceso en puerto 3000
netstat -ano | findstr ":3000"
taskkill /PID <numero_pid> /F
```
