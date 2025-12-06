# Rawson Bank System 🏦

Sistema bancario distribuido basado en microservicios con Spring Boot 3.3.3, Java 21, Apache Kafka y React.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Documentación Completa](#documentación-completa)

## ⚙️ Requisitos

- **Docker Desktop** (con WSL2 backend recomendado para Windows)
- **Node.js 18+** y npm
- **Git**
- *Opcional*: Java JDK 21 (solo para desarrollo local sin Docker)

## 🚀 Inicio Rápido

### Opción 1: Scripts Automáticos (Windows)

1. **Levantar Backend y Servicios:**
   ```cmd
   start-backend.bat
   ```

2. **Levantar Frontend** (en otra terminal):
   ```cmd
   start-frontend.bat
   ```

3. **Detener servicios:**
   ```cmd
   stop-backend.bat
   ```

### Opción 2: Comandos Manuales

1. **Levantar Backend y Servicios:**
   ```cmd
   docker-compose up --build
   ```

2. **Levantar Frontend** (en otra terminal):
   ```cmd
   cd frontend-bank-system
   npm install
   npm run dev
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
  - Base de datos relacional
  
- **Apache Kafka** - Puerto 9092
  - Sistema de mensajería y streaming de eventos
  
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

## 🔗 URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Eureka Dashboard | http://localhost:8761 |
| API Gateway | http://localhost:8085 |
| Backend Bank System | http://localhost:8080 |
| Ledger Service | http://localhost:8081 |
| Orchestrator Service | http://localhost:8082 |

## ✅ Verificación Rápida

Después de levantar los servicios:

1. **Eureka**: http://localhost:8761 - Verifica que todos los servicios están registrados
2. **Health Checks**:
   - Backend: http://localhost:8080/actuator/health
   - Ledger: http://localhost:8081/actuator/health
   - Orchestrator: http://localhost:8082/actuator/health
   - Gateway: http://localhost:8085/actuator/health
3. **Frontend**: http://localhost:3000 - Verifica que carga correctamente

## 🐛 Solución de Problemas

Si encuentras problemas:

1. Asegúrate de que Docker Desktop está corriendo
2. Verifica que los puertos no están en uso
3. Revisa los logs: `docker-compose logs -f [nombre-servicio]`
4. Consulta la [documentación completa](./INSTRUCCIONES_EJECUCION.md)

## 📝 Notas de Desarrollo

- El proyecto usa Java 21 con toolchain de Gradle
- Todos los servicios tienen healthchecks configurados
- Las dependencias entre servicios se manejan automáticamente en docker-compose
- La base de datos se inicializa automáticamente (ddl-auto: update)

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