# rawson-pruebatecnica-bank

## Requisitos
- Java JDK 21 (JAVA_HOME configurado)
- Docker Desktop (WSL2 backend recomendado)
- Node.js 18+ (para desarrollo local del frontend)
- Git

## Arranque rápido con Docker Compose

Para levantar todos los servicios (backend, frontend, base de datos PostgreSQL):

```bash
docker-compose up --build
```

Esto levantará:
- **PostgreSQL**: `localhost:5432` (usuario: postgres, password: postgres, base de datos: rawsondb)
- **Backend (Java + Gradle)**: `localhost:8080`
- **Frontend (Vite)**: `localhost:5173`
- **Service Registry**: `localhost:8761`
- **API Gateway**: `localhost:8085`
- **Ledger Service**: `localhost:8081`

## Desarrollo local del Frontend

Para desarrollo del frontend sin Docker:

```bash
cd frontend-bank-system
npm install
npm run dev
```

El servidor de desarrollo Vite se iniciará en `http://localhost:5173` con hot-reload habilitado.

## Pasos locales rápidos (configuración avanzada)

1. Clona y crea branch:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/gradle-docker-java21
   ```

2. Asegúrate del Gradle Wrapper (si falta genera y añade):
   ```bash
   # PowerShell (en la raíz del repo)
   docker run --rm -v "${PWD}:/home/gradle/project" -w /home/gradle/project gradle:8.4.3-jdk17 gradle wrapper --gradle-version 8.4.3
   ```

3. Normaliza gradlew a LF si trabajas en Windows:
   ```bash
   Copy-Item .\gradlew .\gradlew.bak
   (Get-Content .\gradlew -Raw) -replace "`r`n","`n" | Set-Content -NoNewline -Encoding UTF8 .\gradlew
   ```

4. Commit de wrapper:
   ```bash
   git add gradlew gradlew.bat gradle/wrapper/gradle-wrapper.properties gradle/wrapper/gradle-wrapper.jar
   git commit -m "Add Gradle Wrapper and Docker/CI adjustments for Java 21"
   git push origin fix/gradle-docker-java21
   ```

5. Rebuild y run:
   ```bash
   docker builder prune --force
   docker compose build --no-cache
   docker compose up
   ```

## Verificación

- Service Registry: http://localhost:8761
- Gateway: http://localhost:8085
- Backend: http://localhost:8080
- Frontend: http://localhost:5173