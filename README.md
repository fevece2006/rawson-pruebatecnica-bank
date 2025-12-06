# rawson-pruebatecnica-bank

## Requisitos
- Java JDK 21 (JAVA_HOME configurado)
- Docker Desktop (WSL2 backend recomendado)
- Node.js 18+ (para desarrollo frontend local)
- Git

## Inicio Rápido con Docker

### Levantar todos los servicios (backend, frontend y base de datos)

```bash
docker-compose up --build
```

Este comando levantará:
- **PostgreSQL**: Base de datos en `localhost:5432`
- **Service Registry**: Eureka en `http://localhost:8761`
- **API Gateway**: Gateway en `http://localhost:8085`
- **Backend Bank System**: Backend en `http://localhost:8080`
- **Ledger Service**: Servicio de ledger en `http://localhost:8081`
- **Frontend Bank System**: Frontend Vite en `http://localhost:5173`

### Desarrollo Frontend Local (sin Docker)

Para desarrollo frontend local con hot-reload:

```bash
cd frontend-bank-system
npm install
npm run dev
```

El servidor de desarrollo Vite estará disponible en `http://localhost:5173`

## Pasos de Configuración Manual

### 1. Clonar el repositorio:
```bash
git clone https://github.com/fevece2006/rawson-pruebatecnica-bank.git
cd rawson-pruebatecnica-bank
```

### 2. Asegurar Gradle Wrapper (si falta):
```bash
# PowerShell (en la raíz del repo)
docker run --rm -v "${PWD}:/home/gradle/project" -w /home/gradle/project gradle:8.4.3-jdk17 gradle wrapper --gradle-version 8.4.3
```

### 3. Normalizar gradlew a LF (si trabajas en Windows):
```bash
# PowerShell
Copy-Item .\gradlew .\gradlew.bak
(Get-Content .\gradlew -Raw) -replace "`r`n","`n" | Set-Content -NoNewline -Encoding UTF8 .\gradlew
```

### 4. Rebuild y run:
```bash
docker builder prune --force
docker compose build --no-cache
docker compose up
```

## Verificación de Servicios
- **Service Registry**: http://localhost:8761
- **API Gateway**: http://localhost:8085
- **Backend Bank System**: http://localhost:8080
- **Frontend Bank System**: http://localhost:5173
- **PostgreSQL**: localhost:5432

## Variables de Entorno

El backend se conecta a PostgreSQL con las siguientes variables:
- `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/rawsondb`
- `SPRING_DATASOURCE_USERNAME=postgres`
- `SPRING_DATASOURCE_PASSWORD=postgres`