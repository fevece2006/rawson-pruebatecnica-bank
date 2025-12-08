# Instrucciones de Ejecución - Rawson Bank System

## Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **Node.js 18+** y npm instalados
- **Java 21** (opcional, solo si se ejecuta localmente sin Docker)
- **Git** instalado

## Arquitectura del Sistema

El proyecto está compuesto por:

### Backend Services (Ejecutar con Docker)
- **Service Registry** (Eureka) - Puerto 8761
- **API Gateway** - Puerto 8085
- **Backend Bank System** - Puerto 8083
- **Ledger Service** - Puerto 8081
- **Orchestrator Service** - Puerto 8082
- **Keycloak** (Autenticación) - Puerto 8080
- **PostgreSQL** - Puerto 5432 (databases: bank, keycloak)
- **Kafka** + **Zookeeper** - Puertos 9092, 2181
- **Kafka UI** - Puerto 8090

### Frontend (Ejecutar localmente)
- **Frontend Bank System** (React) - Puerto 3000

---

## ⚠️ IMPORTANTE: Cierre Correcto del Proyecto

**Antes de iniciar, es CRÍTICO cerrar correctamente el proyecto para evitar errores de Kafka/Zookeeper.**

### ❌ Cierre INCORRECTO (Puede causar errores):
```bash
# NO usar Ctrl+C si los servicios están en foreground
# NO cerrar Docker Desktop sin detener servicios
# NO reiniciar Windows sin detener servicios
```

### ✅ Cierre CORRECTO:

```bash
# Opción 1: Detener servicios manteniendo volúmenes (datos persistentes)
docker-compose down

# Opción 2: Detener servicios y limpiar volúmenes (reset completo)
docker-compose down -v
```

**Cuándo usar cada opción:**
- **`docker-compose down`**: Uso normal. Mantiene las bases de datos y configuraciones.
- **`docker-compose down -v`**: Si hay errores de Kafka/Zookeeper o quieres reset completo.

---

## 🚀 Paso 1: Levantar Backend y Contenedores con Docker

### INICIO LIMPIO (Recomendado para evitar problemas)

```bash
# 1. Detener y limpiar contenedores anteriores
docker-compose down -v

# 2. Levantar servicios frescos
docker-compose up -d

# 3. Verificar estado (esperar 1-2 minutos)
docker-compose ps
```

**Todos los servicios deben mostrar estado "healthy" o "running".**

### INICIO NORMAL (Si ya funciona correctamente)

```bash
# Levantar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

### ⚙️ Configurar Keycloak

**Si usaste `docker-compose down -v` o es la primera vez**, ejecuta:

```powershell
# Esperar 30 segundos a que Keycloak esté listo
Start-Sleep -Seconds 30

# Configurar realm y usuarios
.\configure-keycloak-client.ps1
```

Este script:
- Importa el realm `rawson-bank`
- Configura el cliente frontend con PKCE
- Crea usuarios: testuser/password123, admin/admin123

**Si usaste `docker-compose down` sin `-v`**, el realm ya existe y NO necesitas reconfigurarlo.

### Acceder a los servicios:

- **Frontend**: http://localhost:3000
- **Keycloak**: http://localhost:8080 (admin / admin)
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8085
- **Backend Bank System**: http://localhost:8083
- **Ledger Service**: http://localhost:8081
- **Orchestrator Service**: http://localhost:8082
- **Kafka UI**: http://localhost:8090
- **PostgreSQL**: localhost:5432 (usuario: bank, password: bank)

---

## 🎨 Paso 2: Levantar Frontend con npm

Abre una **nueva terminal** y navega a la carpeta del frontend:

```bash
cd frontend-bank-system
```

Instalar dependencias (solo la primera vez):

```bash
npm install
```

Ejecutar el frontend en modo desarrollo:

**Opción 1 - Usando el script (Recomendado):**
```powershell
.\start-frontend-fixed.ps1
```

**Opción 2 - Manualmente:**
```bash
npm start
```

El frontend estará disponible en: **http://localhost:3000**

### Credenciales de Acceso

**Usuario Regular:**
- Usuario: `testuser`
- Contraseña: `password123`

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 🛑 Detener los Servicios CORRECTAMENTE

### ⚠️ IMPORTANTE: Siempre detén los servicios antes de cerrar Docker o apagar el PC

**Detener frontend:**
```bash
# En la terminal del frontend, presionar:
Ctrl + C

# Confirmar con: S (Sí) o Y (Yes)
```

**Detener backend y contenedores:**

```bash
# Opción 1: Detener servicios manteniendo datos
docker-compose down

# Opción 2: Detener servicios y eliminar volúmenes (reset completo)
docker-compose down -v
```

### 🔄 Cuándo usar cada comando de cierre:

| Comando | Cuándo usarlo | Resultado |
|---------|---------------|-----------|
| `docker-compose down` | **Cierre normal del día** | Mantiene bases de datos, configuraciones de Keycloak, topics de Kafka |
| `docker-compose down -v` | **Hay errores de Kafka/Zookeeper**<br>**Quieres empezar desde cero**<br>**Problemas de sesiones** | Elimina TODO: bases de datos, volúmenes, configuraciones<br>⚠️ Deberás reconfigurar Keycloak |

### ⚠️ Errores Comunes por Cierre Incorrecto:

Si ves estos errores al iniciar:
```
ERROR: node already exists and owner does not match
KeeperException$NodeExistsException
```

**Solución:**
```bash
# 1. Limpiar volúmenes corruptos
docker-compose down -v

# 2. Iniciar limpio
docker-compose up -d

# 3. Reconfigurar Keycloak
.\configure-keycloak-client.ps1
```

### Detener frontend:

En la terminal donde está corriendo el frontend, presiona `Ctrl+C`

---

## 📋 Comandos Útiles

### Ver logs de un servicio específico:

```cmd
docker-compose logs -f backend-bank-system
docker-compose logs -f ledger-service
docker-compose logs -f api-gateway
```

### Reconstruir un servicio específico:

```cmd
docker-compose up --build backend-bank-system
```

### Verificar salud de los servicios:

```cmd
curl http://localhost:8083/actuator/health  # Backend Bank System
curl http://localhost:8081/actuator/health  # Ledger Service
curl http://localhost:8082/actuator/health  # Orchestrator Service
curl http://localhost:8085/actuator/health  # API Gateway
curl http://localhost:8761/               # Eureka Registry
curl http://localhost:8080/realms/rawson-bank  # Keycloak Realm
```

### Limpiar imágenes y contenedores:

```cmd
docker system prune -a
```

---

## 🔧 Solución de Problemas

### Error: Puerto ya en uso

Si recibes un error indicando que un puerto ya está en uso, verifica qué proceso está usando ese puerto:

```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :8761

# Detener proceso por PID
taskkill /PID <numero> /F
```

### Error: No se puede conectar a Docker

Asegúrate de que Docker Desktop está ejecutándose. Reinícialo si es necesario.

### Kafka no se conecta

```bash
# Limpiar volúmenes y reiniciar
docker-compose down -v
docker-compose up -d
```

### Keycloak muestra "Page not found"

```powershell
# Re-importar realm y configurar cliente
.\configure-keycloak-client.ps1
```

### Frontend con warnings de source maps

Los warnings de `@react-keycloak` son normales y están suprimidos. Si aparecen:
- Verifica que existe `frontend-bank-system/.env` con `GENERATE_SOURCEMAP=false`
- Usa `npm start` en lugar de `react-scripts start`

### Error en conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Ver logs
docker logs postgres-bank

# Reconectar desde psql
docker exec -it postgres-bank psql -U bank -d bank
```

### Error en el build de Gradle

Si hay errores de compilación, limpia el cache de Gradle:

```bash
./gradlew clean
```

### Frontend no se conecta al backend

- Verifica que todos los servicios estén "healthy": `docker-compose ps`
- Revisa las variables en `frontend-bank-system/.env`
- Verifica Keycloak: http://localhost:8080/realms/rawson-bank

---

## 🗄️ Acceso a PostgreSQL

### Desde línea de comandos

```bash
# Conectarse a la base de datos 'bank'
docker exec -it postgres-bank psql -U bank -d bank

# Conectarse a la base de datos 'keycloak'
docker exec -it postgres-bank psql -U bank -d keycloak
```

### Comandos útiles en psql

```sql
-- Ver todas las tablas
\dt

-- Describir una tabla
\d accounts
\d ledger_entries
\d saga_instances

-- Ver datos
SELECT * FROM accounts;
SELECT * FROM ledger_entries ORDER BY created_at DESC LIMIT 10;

-- Salir
\q
```

### Desde herramientas GUI (DBeaver, pgAdmin, etc.)

**Configuración de conexión:**
```
Host: localhost
Port: 5432
Database: bank (o keycloak)
Username: bank
Password: bank
```

### Conexión JDBC

```
jdbc:postgresql://localhost:5432/bank?user=bank&password=bank
```

---

## 📊 Estructura de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Service Registry (Eureka) | 8761 | http://localhost:8761 |
| API Gateway | 8085 | http://localhost:8085 |
| Backend Bank System | 8083 | http://localhost:8083/actuator/health |
| Ledger Service | 8081 | http://localhost:8081/actuator/health |
| Orchestrator Service | 8082 | http://localhost:8082/actuator/health |
| Keycloak | 8080 | http://localhost:8080 |
| Frontend React | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | jdbc:postgresql://localhost:5432/bank |
| Kafka | 9092 | localhost:9092 |
| Kafka UI | 8090 | http://localhost:8090 |
| Zookeeper | 2181 | localhost:2181 |

---

## ✅ Verificación de Funcionalidad

1. **Verificar Docker Containers**: 
   ```bash
   docker-compose ps  # Todos deben mostrar estado "healthy" o "running"
   ```

2. **Verificar Eureka**: 
   - Accede a http://localhost:8761 
   - Verifica que los servicios están registrados: BACKEND-BANK-SYSTEM, LEDGER-SERVICE, ORCHESTRATOR-SERVICE

3. **Verificar Keycloak**: 
   - Accede a http://localhost:8080
   - Verifica el realm: http://localhost:8080/realms/rawson-bank
   - Credenciales admin: admin/admin123

4. **Verificar API Gateway**: 
   ```bash
   curl http://localhost:8085/actuator/health
   ```

5. **Verificar Backend Services**:
   ```bash
   curl http://localhost:8083/actuator/health  # Backend
   curl http://localhost:8081/actuator/health  # Ledger
   curl http://localhost:8082/actuator/health  # Orchestrator
   ```

6. **Verificar Kafka UI**: 
   - Accede a http://localhost:8090
   - Verifica que se ven los topics: saga-commands, saga-events, account-events, etc.

7. **Verificar Frontend**: 
   - Accede a http://localhost:3000
   - Debe cargar la página de login de Keycloak
   - Usa credenciales: testuser/password123 o admin/admin123

---

## 🏗️ Tecnologías Utilizadas

- **Java 21**
- **Spring Boot 3.3.3**
- **Spring Cloud 2023.0.0**
- **PostgreSQL 15**
- **Apache Kafka**
- **React 18**
- **Docker & Docker Compose**
- **Gradle**
- **Apache Camel**
- **Resilience4j**

---

## 📝 Notas Adicionales

- El proyecto usa Java 21 con Eclipse Temurin JDK/JRE
- Todos los servicios backend están configurados para registrarse automáticamente en Eureka
- La base de datos PostgreSQL se inicializa automáticamente con las tablas necesarias (ddl-auto: update)
- Kafka está configurado para ejecutarse en modo single-broker (desarrollo)
- Los healthchecks garantizan que los servicios dependientes esperen a que sus dependencias estén listas

---

## 🔄 Flujo de Trabajo Recomendado

### 📅 Inicio del Día / Sesión de Trabajo

```bash
# 1. Asegurarse de que Docker Desktop está corriendo
# 2. Levantar servicios
docker-compose up -d

# 3. Esperar 1-2 minutos y verificar estado
docker-compose ps

# 4. Si todos están "healthy", levantar frontend
cd frontend-bank-system
npm start

# 5. Acceder a http://localhost:3000
```

### 📅 Fin del Día / Sesión de Trabajo

```bash
# 1. Detener frontend (Ctrl+C en su terminal)

# 2. Detener backend
docker-compose down

# 3. (Opcional) Cerrar Docker Desktop
```

### 🔧 Si encuentras Problemas

```bash
# Reset completo
docker-compose down -v
docker-compose up -d

# Esperar 30 segundos
Start-Sleep -Seconds 30

# Reconfigurar Keycloak
.\configure-keycloak-client.ps1

# Verificar PostgreSQL
docker exec -it postgres-bank psql -U bank -d bank -c "ALTER USER bank WITH PASSWORD 'bank';"

# Levantar frontend
cd frontend-bank-system
npm start
```

---

## ⚠️ Checklist Pre-Cierre (Evitar Errores)

Antes de cerrar el proyecto o apagar tu computadora:

- [ ] Detener frontend con `Ctrl+C`
- [ ] Ejecutar `docker-compose down`
- [ ] Verificar que todos los contenedores se detuvieron: `docker ps`
- [ ] Solo entonces cerrar Docker Desktop o apagar PC

**NO hacer:**
- ❌ Cerrar Docker Desktop con servicios corriendo
- ❌ Apagar PC sin ejecutar `docker-compose down`
- ❌ Presionar Ctrl+C en terminal de `docker-compose up` (sin `-d`)
- ❌ Forzar cierre de terminales con servicios activos

**Estos errores causan problemas de Kafka/Zookeeper que requieren `docker-compose down -v`**
