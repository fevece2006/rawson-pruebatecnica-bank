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
- **Backend Bank System** - Puerto 8080
- **Ledger Service** - Puerto 8081
- **Orchestrator Service** - Puerto 8082
- **PostgreSQL** - Puerto 5432
- **Kafka** + **Zookeeper** - Puertos 9092, 2181

### Frontend (Ejecutar localmente)
- **Frontend Bank System** (React) - Puerto 3000

---

## 🚀 Paso 1: Levantar Backend y Contenedores con Docker

Desde la raíz del proyecto, ejecutar:

```cmd
docker-compose up --build
```

Este comando:
- Construye todas las imágenes Docker de los servicios
- Levanta PostgreSQL, Kafka, Zookeeper
- Levanta todos los microservicios Java
- Configura la red y dependencias entre servicios

### Verificar que los servicios están corriendo

Espera unos minutos hasta que todos los servicios estén saludables. Puedes verificar el estado con:

```cmd
docker-compose ps
```

Deberías ver todos los contenedores en estado "healthy" o "running".

### Acceder a los servicios:

- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8085
- **Backend Bank System**: http://localhost:8080
- **Ledger Service**: http://localhost:8081
- **Orchestrator Service**: http://localhost:8082
- **PostgreSQL**: localhost:5432 (usuario: bank, password: bank, db: bankdb)
- **Kafka**: localhost:9092

---

## 🎨 Paso 2: Levantar Frontend con npm

Abre una **nueva terminal** y navega a la carpeta del frontend:

```cmd
cd frontend-bank-system
```

Instalar dependencias (solo la primera vez):

```cmd
npm install
```

Ejecutar el frontend en modo desarrollo:

```cmd
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

---

## 🛑 Detener los Servicios

### Detener backend y contenedores:

```cmd
docker-compose down
```

Para eliminar también los volúmenes (base de datos):

```cmd
docker-compose down -v
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
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8085/actuator/health
```

### Limpiar imágenes y contenedores:

```cmd
docker system prune -a
```

---

## 🔧 Solución de Problemas

### Error: Puerto ya en uso

Si recibes un error indicando que un puerto ya está en uso, verifica qué proceso está usando ese puerto:

```cmd
netstat -ano | findstr :8080
netstat -ano | findstr :8761
```

Detén el proceso o cambia el puerto en el archivo `docker-compose.yml`

### Error: No se puede conectar a Docker

Asegúrate de que Docker Desktop está ejecutándose. Reinícialo si es necesario.

### Error en el build de Gradle

Si hay errores de compilación, limpia el cache de Gradle:

```cmd
gradlew clean
```

### Frontend no se conecta al backend

Verifica que la variable `REACT_APP_BACKEND_URL` en el frontend apunta al API Gateway correcto (por defecto: http://localhost:8085)

---

## 📊 Estructura de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Service Registry | 8761 | http://localhost:8761 |
| API Gateway | 8085 | http://localhost:8085 |
| Backend Bank System | 8080 | http://localhost:8080 |
| Ledger Service | 8081 | http://localhost:8081 |
| Orchestrator Service | 8082 | http://localhost:8082 |
| Frontend React | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | jdbc:postgresql://localhost:5432/bankdb |
| Kafka | 9092 | localhost:9092 |
| Zookeeper | 2181 | localhost:2181 |

---

## ✅ Verificación de Funcionalidad

1. **Verificar Eureka**: Accede a http://localhost:8761 y verifica que todos los servicios están registrados
2. **Verificar API Gateway**: Accede a http://localhost:8085/actuator/health
3. **Verificar Backend**: Accede a http://localhost:8080/actuator/health
4. **Verificar Frontend**: Accede a http://localhost:3000 y verifica que carga la interfaz

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
