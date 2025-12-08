# Guía Rápida de Troubleshooting

## 🔍 Problemas Comunes y Soluciones

### 1. Docker no inicia los contenedores

**Síntomas**: Error al ejecutar `docker-compose up`

**Soluciones**:

```cmd
# Verificar que Docker Desktop está corriendo
docker --version
docker ps

# Limpiar contenedores y volúmenes antiguos
docker-compose down -v
docker system prune -f

# Reconstruir desde cero
docker-compose up --build --force-recreate
```

### 2. Error: "Port already in use"

**Síntomas**: `bind: address already in use`

**Solución**:

```cmd
# Windows - Identificar proceso usando el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :8761
netstat -ano | findstr :5432

# Detener el proceso o cambiar el puerto en docker-compose.yml
```

### 3. Servicios no se registran en Eureka

**Síntomas**: Eureka Dashboard vacío en `http://localhost:8761`

**Soluciones**:

```cmd
# Ver logs del service-registry
docker-compose logs -f service-registry

# Ver logs del servicio que no se registra
docker-compose logs -f backend-bank-system

# Verificar que EUREKA_CLIENT_SERVICEURL_DEFAULTZONE está correcto
docker-compose exec backend-bank-system env | grep EUREKA
```

### 4. Error de conexión a PostgreSQL

**Síntomas**: `Connection refused` o `Unable to connect to database`

**Soluciones**:

```cmd
# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Verificar que PostgreSQL está healthy
docker-compose ps

# Reiniciar solo PostgreSQL
docker-compose restart postgres

# Verificar variables de entorno
docker-compose exec backend-bank-system env | grep SPRING_DATASOURCE
```

### 5. Error de compilación Gradle

**Síntomas**: `BUILD FAILED` en Docker

**Soluciones**:

```cmd
# Limpiar cache de Gradle localmente
gradlew clean

# Eliminar contenedores y reconstruir
docker-compose down
docker-compose build --no-cache backend-bank-system

# Ver logs detallados del build
docker-compose up --build backend-bank-system
```

### 6. Frontend no carga o no conecta al backend

**Síntomas**: Error de red en `http://localhost:3000`, warnings de source maps, Keycloak "Page not found"

**Soluciones**:

```bash
# 1. Verificar que el archivo .env existe
cd frontend-bank-system
cat .env  # O: type .env en Windows

# 2. Si no existe, crear .env con la configuración correcta
# Ver FRONTEND_CONFIG.md para contenido completo

# 3. Instalar dependencias (incluye cross-env)
npm install

# 4. Verificar que Keycloak está funcionando
curl http://localhost:8080/realms/rawson-bank

# 5. Si Keycloak muestra "Page not found", importar realm
cd ..
.\configure-keycloak-client.ps1

# 6. Verificar que backend services están corriendo
curl http://localhost:8082/actuator/health  # Orchestrator
curl http://localhost:8083/actuator/health  # Backend
curl http://localhost:8085/actuator/health  # API Gateway

# 7. Iniciar frontend con el script correcto
.\start-frontend-fixed.ps1

# Credenciales para login:
# Usuario: testuser / password123
# Admin: admin / admin123
```

### 7. Error 503 en API Gateway

**Síntomas**: `503 Service Unavailable` al acceder al gateway

**Soluciones**:

```cmd
# Verificar que los servicios backend están registrados en Eureka
# Acceder a http://localhost:8761

# Ver logs del gateway
docker-compose logs -f api-gateway

# Verificar rutas configuradas en application.yml
# api-gateway/src/main/resources/application.yml
```

### 8. Kafka no arranca

**Síntomas**: Servicios que dependen de Kafka fallan

**Soluciones**:

```cmd
# Ver logs de Kafka y Zookeeper
docker-compose logs -f kafka
docker-compose logs -f zookeeper

# Reiniciar Kafka y dependencias
docker-compose restart zookeeper
docker-compose restart kafka

# Verificar que Zookeeper está corriendo antes de Kafka
docker-compose up -d zookeeper
# Esperar unos segundos
docker-compose up -d kafka
```

### 9. Healthcheck falla constantemente

**Síntomas**: Contenedor en estado `unhealthy`

**Soluciones**:

```cmd
# Ver por qué falla el healthcheck
docker-compose ps

# Ejecutar healthcheck manualmente
docker-compose exec backend-bank-system curl -f http://localhost:8083/actuator/health
docker-compose exec ledger-service curl -f http://localhost:8081/actuator/health
docker-compose exec orchestrator-service curl -f http://localhost:8082/actuator/health

# Si curl no está disponible, instalar o cambiar healthcheck a usar wget
```

### 10. Problemas de memoria en Docker

**Síntomas**: `Out of memory` o Docker muy lento

**Soluciones**:

1. Aumentar recursos de Docker Desktop:
   - Settings → Resources → Memory (mínimo 4GB)
   - Settings → Resources → CPU (mínimo 2 cores)

2. Limpiar recursos no utilizados:

```cmd
docker system prune -a --volumes
```

## 🔧 Comandos Útiles de Diagnóstico

### Ver estado de todos los contenedores

```cmd
docker-compose ps
```

### Ver logs en tiempo real

```cmd
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f backend-bank-system

# Últimas 100 líneas
docker-compose logs --tail=100 backend-bank-system
```

### Entrar a un contenedor

```cmd
docker-compose exec backend-bank-system sh
docker-compose exec postgres psql -U bank -d bankdb
```

### Verificar conectividad entre servicios

```cmd
# Desde un contenedor, hacer ping a otro
docker-compose exec backend-bank-system ping postgres
docker-compose exec backend-bank-system curl http://service-registry:8761/eureka/apps
```

### Ver consumo de recursos

```cmd
docker stats
```

### Reiniciar un servicio específico

```cmd
docker-compose restart backend-bank-system
```

### Reconstruir un servicio sin afectar otros

```cmd
docker-compose up -d --build --no-deps backend-bank-system
```

## 📊 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Docker Desktop está corriendo
- [ ] Hay suficiente espacio en disco (mínimo 10GB)
- [ ] Hay suficiente memoria asignada a Docker (mínimo 4GB)
- [ ] Los puertos no están siendo usados por otros procesos
- [ ] El servicio Eureka está corriendo y saludable (http://localhost:8761)
- [ ] PostgreSQL está corriendo y saludable (puerto 5432)
- [ ] Kafka y Zookeeper están corriendo (puertos 9092, 2181)
- [ ] Keycloak está corriendo con realm configurado (http://localhost:8080/realms/rawson-bank)
- [ ] Las variables de entorno están correctas (revisar `.env` en frontend)
- [ ] No hay cambios sin guardar en archivos de configuración

### Verificación de Estado de Servicios

```bash
# Verificar todos los contenedores
docker-compose ps

# Verificar Keycloak realm
curl http://localhost:8080/realms/rawson-bank

# Verificar health endpoints
curl http://localhost:8083/actuator/health  # Backend
curl http://localhost:8081/actuator/health  # Ledger
curl http://localhost:8082/actuator/health  # Orchestrator
curl http://localhost:8085/actuator/health  # API Gateway

# Verificar Kafka
docker logs kafka-bank 2>&1 | grep -i "started"

# Verificar PostgreSQL
docker exec -it postgres-bank psql -U bank -d bank -c "\dt"
```

## 🆘 Si Nada Funciona

### Reset Completo

```cmd
# 1. Detener todo
docker-compose down -v

# 2. Limpiar todo Docker
docker system prune -a --volumes
# ADVERTENCIA: Esto elimina TODOS los contenedores, imágenes y volúmenes

# 3. Reconstruir desde cero
docker-compose up --build

# 4. Si sigue fallando, reiniciar Docker Desktop
```

### Verificación de Instalación

```cmd
# Verificar versiones
docker --version          # Debe ser 20.10+
docker-compose --version  # Debe ser 2.0+
node --version            # Debe ser 18+
npm --version             # Debe ser 8+
java -version             # Debe ser 21 (opcional)
```

## 📞 Información de Soporte

Si el problema persiste:

1. Recopilar logs: `docker-compose logs > logs.txt`
2. Capturar `docker-compose ps`
3. Capturar `docker stats`
4. Revisar RESUMEN_CAMBIOS.md para arquitectura
5. Revisar INSTRUCCIONES_EJECUCION.md para setup correcto

## 🔗 Enlaces Útiles

- Documentación Docker: <https://docs.docker.com/>
- Documentación Spring Boot: <https://docs.spring.io/spring-boot/>
- Documentación Spring Cloud: <https://spring.io/projects/spring-cloud>
- Documentación React: <https://react.dev/>
