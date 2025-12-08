# Rawson Bank System 🏦

Sistema bancario distribuido basado en microservicios con Spring Boot 3.3.3, Java 21, Apache Kafka y React.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Inicio Rápido](#inicio-rápido)
- [Acceso a Servicios](#acceso-a-servicios)
- [Acceso a Base de Datos](#acceso-a-base-de-datos)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Documentación Completa](#documentación-completa)

## ⚙️ Requisitos

- **Docker Desktop** (con WSL2 backend recomendado para Windows)
- **Node.js 18+** y npm
- **Git**
- *Opcional*: Java JDK 21 (solo para desarrollo local sin Docker)

## 🚀 Inicio Rápido

⚠️ **IMPORTANTE**: Lee [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) para comandos esenciales de inicio/cierre.

### Inicio Normal (Todo funcionando)

1. **Levantar Backend:**
   ```bash
   docker-compose up -d
   docker-compose ps  # Verificar que estén "healthy"
   ```

2. **Levantar Frontend:**
   ```bash
   cd frontend-bank-system
   npm start
   ```

3. **Acceder:** http://localhost:3000

### Inicio Limpio (Si hay problemas de Kafka/Zookeeper)

1. **Reset completo:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. **Configurar Keycloak:**
   ```powershell
   Start-Sleep -Seconds 30
   .\configure-keycloak-client.ps1
   ```

3. **Levantar Frontend:**
   ```bash
   cd frontend-bank-system
   npm start
   ```

### Cierre Correcto

```bash
# 1. Detener frontend: Ctrl+C
# 2. Detener backend:
docker-compose down
```

**Ver [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) para más comandos.**

### Opción 2: Comandos Manuales

1. **Levantar Backend y Servicios:**
   ```bash
   docker-compose up -d --build
   ```

2. **Levantar Frontend:**
   ```bash
   cd frontend-bank-system
   npm install
   npm start
   ```

3. **Detener servicios:**
   ```cmd
   docker-compose down
   ```

## 🏗️ Arquitectura

El sistema está compuesto por:

### Microservicios Backend (Docker)

- **Service Registry (Eureka)** - Puerto 8761
  - Registro y descubrimiento de servicios
  
- **API Gateway** - Puerto 8085
  - Punto de entrada único, enrutamiento y balanceo de carga
  
- **Backend Bank System** - Puerto 8080
  - Gestión de cuentas bancarias y transacciones
  
- **Ledger Service** - Puerto 8081
  - Registro de asientos contables y auditoria
  
- **Orchestrator Service** - Puerto 8082
  - Orquestación de Sagas y flujos complejos

### Infraestructura (Docker)

- **PostgreSQL** - Puerto 5432
  - Base de datos relacional (databases: bank, keycloak)
  - Credenciales: bank / bank
  
- **Keycloak** - Puerto 8080
  - Autenticación y autorización OAuth2/JWT
  - Admin: admin / admin
  - Realm: rawson-bank
  
- **Apache Kafka** - Puerto 9092
  - Sistema de mensajería y streaming de eventos
  
- **Kafka UI** - Puerto 8090
  - Interfaz web para monitoreo de Kafka
  
- **Zookeeper** - Puerto 2181
  - Coordinación de Kafka

### Frontend (Local)

- **React Application** - Puerto 3000
  - Interfaz de usuario web

## 🛠️ Tecnologías

### Backend
- Java 21 (Eclipse Temurin)
- Spring Boot 3.3.3
- Spring Cloud 2023.0.0 (Eureka, Gateway)
- Spring Data JPA
- Apache Kafka
- Apache Camel 4.0.0
- Resilience4j
- PostgreSQL 15

### Frontend
- React 18
- Axios
- React Scripts 5.0.1

### DevOps
- Docker & Docker Compose
- Gradle 8.4.3
- Multi-stage Dockerfile builds

## 📚 Documentación Completa

Para instrucciones detalladas, solución de problemas y comandos avanzados, consulta:

➡️ **[INSTRUCCIONES_EJECUCION.md](./INSTRUCCIONES_EJECUCION.md)**

## 🔗 Acceso a Servicios

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|--------------|
| **Frontend** | 3000 | http://localhost:3000 | Ver Keycloak abajo |
| **Keycloak** | 8080 | http://localhost:8080 | admin / admin |
| **Eureka Dashboard** | 8761 | http://localhost:8761 | - |
| **API Gateway** | 8085 | http://localhost:8085 | - |
| **Backend Bank System** | 8083 | http://localhost:8083 | - |
| **Ledger Service** | 8081 | http://localhost:8081 | - |
| **Orchestrator Service** | 8082 | http://localhost:8082 | - |
| **Kafka UI** | 8090 | http://localhost:8090 | - |

### 🔐 Credenciales Keycloak (Frontend)

**Usuario Regular:**
- Usuario: `testuser`
- Contraseña: `password123`
- Rol: bank-user

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`
- Rol: bank-admin

## 🗄️ Acceso a Base de Datos

### PostgreSQL

**Conexión desde herramientas externas (DBeaver, pgAdmin, etc.):**

```
Host: localhost
Port: 5432
Database: bank
Username: bank
Password: bank
```

**Conexión desde línea de comandos:**

```bash
# Docker exec (recomendado)
docker exec -it postgres-bank psql -U bank -d bank

# O usando psql local
psql -h localhost -p 5432 -U bank -d bank
```

**Comandos útiles en psql:**

```sql
-- Ver todas las tablas
\dt

-- Describir una tabla
\d nombre_tabla

-- Ver todas las bases de datos
\l

-- Cambiar de base de datos
\c nombre_base_datos

-- Ver esquemas
\dn

-- Salir
\q

-- Consultas de ejemplo
SELECT * FROM accounts;
SELECT * FROM ledger_entries;
SELECT * FROM saga_instances;
```

**Conexión JDBC (para aplicaciones):**

```
jdbc:postgresql://localhost:5432/bank?user=bank&password=bank
```

### Keycloak Database

Keycloak también usa PostgreSQL. Para acceder:

```bash
docker exec -it postgres-bank psql -U bank -d keycloak
```

## 🔗 URLs de Acceso (Actualizado)

## ✅ Verificación Rápida

Después de levantar los servicios:

1. **Verificar contenedores**:
   ```bash
   docker-compose ps
   ```
   Todos deberían estar "healthy" o "running"

2. **Eureka Dashboard**: http://localhost:8761
   - Verifica que todos los servicios están registrados

3. **Keycloak Realm**: http://localhost:8080/realms/rawson-bank
   - Debe devolver 200 (JSON con configuración del realm)

4. **Health Checks**:
   - Backend: http://localhost:8083/actuator/health
   - Ledger: http://localhost:8081/actuator/health
   - Orchestrator: http://localhost:8082/actuator/health
   - Gateway: http://localhost:8085/actuator/health

5. **Frontend**: http://localhost:3000
   - Debe redirigir a Keycloak para login

6. **PostgreSQL**:
   ```bash
   docker exec -it postgres-bank psql -U bank -d bank -c "SELECT COUNT(*) FROM accounts;"
   ```

## 🐛 Solución de Problemas Comunes

### Error: Kafka "NodeExistsException" / ZooKeeper Session Conflict
```bash
# Causa: Cierre incorrecto del proyecto
# Solución: Reset completo
docker-compose down -v
docker-compose up -d
.\configure-keycloak-client.ps1
```

### Servicios no inician o quedan "unhealthy"
```bash
# Limpiar y reiniciar
docker-compose down -v
docker-compose up -d --build
```

### Keycloak "Realm not found"
```bash
.\configure-keycloak-client.ps1
```

### PostgreSQL rechaza conexión
```bash
docker exec -it postgres-bank psql -U bank -d bank -c "ALTER USER bank WITH PASSWORD 'bank';"
```

### Frontend con warnings de source maps
```bash
cd frontend-bank-system
npm install
npm start
```

**Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para más problemas y soluciones.**

### Más ayuda
- **Comandos rápidos**: [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md)
- **Solución de problemas**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Configuración Frontend**: [FRONTEND_CONFIG.md](FRONTEND_CONFIG.md)
- **Instrucciones completas**: [INSTRUCCIONES_EJECUCION.md](INSTRUCCIONES_EJECUCION.md)

## 📝 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) | ⚡ Comandos esenciales de inicio/cierre |
| [INSTRUCCIONES_EJECUCION.md](INSTRUCCIONES_EJECUCION.md) | 📖 Guía paso a paso completa |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 🔧 Solución de problemas |
| [FRONTEND_CONFIG.md](FRONTEND_CONFIG.md) | 🎨 Configuración del frontend |
| [TECHNICAL_DOC.md](TECHNICAL_DOC.md) | 🏗️ Documentación técnica |

## 📝 Notas de Desarrollo

- El proyecto usa Java 21 con toolchain de Gradle
- Todos los servicios tienen healthchecks configurados
- Las dependencias entre servicios se manejan automáticamente en docker-compose
- La base de datos se inicializa automáticamente (ddl-auto: update)
- **IMPORTANTE**: Siempre cierra con `docker-compose down` para evitar errores de Kafka/Zookeeper

## ⚠️ Reglas de Cierre

**Antes de cerrar Docker o apagar el PC:**
1. Detener frontend: `Ctrl+C`
2. Detener backend: `docker-compose down`
3. NO cerrar Docker Desktop con servicios activos
4. Ver [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) para más detalles

## 🤝 Contribuir

1. Crea un branch: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios
3. Commit: `git commit -m "Descripción de cambios"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

## 📄 Licencia

Este proyecto es una prueba técnica para Rawson.

---

**Desarrollado con ❤️ usando Java 21 y Spring Boot 3**