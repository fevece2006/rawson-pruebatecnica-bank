# 🚀 Comandos Rápidos - Rawson Bank System

## ✅ INICIO RÁPIDO

```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Verificar estado (esperar 1-2 minutos)
docker-compose ps

# 3. Levantar frontend
cd frontend-bank-system
npm start
```

## 🛑 CIERRE CORRECTO

```bash
# 1. Detener frontend: Ctrl+C

# 2. Detener backend
docker-compose down
```

---

## 🔄 COMANDOS ESENCIALES

### Inicio Normal (Todo funcionando)
```bash
docker-compose up -d
docker-compose ps
```

### Inicio Limpio (Si hay problemas)
```bash
docker-compose down -v
docker-compose up -d
Start-Sleep -Seconds 30
.\configure-keycloak-client.ps1
```

### Cierre Normal
```bash
docker-compose down
```

### Cierre con Reset Completo
```bash
docker-compose down -v
```

---

## 🔍 VERIFICACIÓN

### Ver estado de contenedores
```bash
docker-compose ps
```

### Ver logs de un servicio
```bash
docker-compose logs -f backend-bank-system
docker-compose logs -f kafka-bank
docker-compose logs -f keycloak-bank
```

### Verificar servicios están saludables
```bash
curl http://localhost:8083/actuator/health  # Backend
curl http://localhost:8081/actuator/health  # Ledger
curl http://localhost:8082/actuator/health  # Orchestrator
curl http://localhost:8085/actuator/health  # API Gateway
curl http://localhost:8761/                 # Eureka
curl http://localhost:8080/realms/rawson-bank  # Keycloak
```

---

## 🗄️ POSTGRESQL

### Conectarse desde Docker
```bash
docker exec -it postgres-bank psql -U bank -d bank
```

### Configurar contraseña (si es necesario)
```bash
docker exec -it postgres-bank psql -U bank -d bank -c "ALTER USER bank WITH PASSWORD 'bank';"
```

### Comandos en psql
```sql
\dt                    -- Ver tablas
\d accounts            -- Describir tabla
SELECT * FROM accounts;
\q                     -- Salir
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "NodeExistsException" de Kafka/Zookeeper
```bash
docker-compose down -v
docker-compose up -d
```

### Error: Keycloak "Realm not found"
```bash
.\configure-keycloak-client.ps1
```

### Error: Frontend con warnings
```bash
cd frontend-bank-system
npm install
npm start
```

### Reconstruir un servicio específico
```bash
docker-compose up -d --build backend-bank-system
```

### Ver todos los contenedores (incluso detenidos)
```bash
docker ps -a
```

### Limpiar todo Docker
```bash
docker-compose down -v
docker system prune -a
```

---

## 📊 PUERTOS RÁPIDOS

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Keycloak | 8080 | http://localhost:8080 |
| Eureka | 8761 | http://localhost:8761 |
| Backend | 8083 | http://localhost:8083 |
| Ledger | 8081 | http://localhost:8081 |
| Orchestrator | 8082 | http://localhost:8082 |
| API Gateway | 8085 | http://localhost:8085 |
| Kafka UI | 8090 | http://localhost:8090 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 👤 CREDENCIALES

### Keycloak Admin
- URL: http://localhost:8080
- Usuario: `admin`
- Contraseña: `admin`

### Frontend (Usuarios de prueba)
- Regular: `testuser` / `password123`
- Admin: `admin` / `admin123`

### PostgreSQL
- Host: `localhost:5432`
- Database: `bank`
- Usuario: `bank`
- Contraseña: `bank`

---

## ⚠️ REGLAS DE ORO

1. **Siempre** detén con `docker-compose down` antes de cerrar
2. **Si hay errores raros**: `docker-compose down -v` y reiniciar
3. **Espera 1-2 minutos** después de `docker-compose up -d`
4. **Verifica** con `docker-compose ps` que todo esté "healthy"
5. **Reconfigura Keycloak** después de `docker-compose down -v`
