# rawson-pruebatecnica-bank

Requisitos
- Java JDK 21 (JAVA_HOME configurado)
- Docker Desktop (WSL2 backend recomendado)
- Git

Pasos locales rápidos
1. Clona y crea branch:
   git checkout main
   git pull origin main
   git checkout -b fix/gradle-docker-java21

2. Asegúrate del Gradle Wrapper (si falta genera y añade):
   # PowerShell (en la raíz del repo)
   docker run --rm -v "${PWD}:/home/gradle/project" -w /home/gradle/project gradle:8.4.3-jdk17 gradle wrapper --gradle-version 8.4.3

3. Normaliza gradlew a LF si trabajas en Windows:
   Copy-Item .\gradlew .\gradlew.bak
   (Get-Content .\gradlew -Raw) -replace "`r`n","`n" | Set-Content -NoNewline -Encoding UTF8 .\gradlew

4. Commit de wrapper:
   git add gradlew gradlew.bat gradle/wrapper/gradle-wrapper.properties gradle/wrapper/gradle-wrapper.jar
   git commit -m "Add Gradle Wrapper and Docker/CI adjustments for Java 21"
   git push origin fix/gradle-docker-java21

5. Rebuild y run:
   docker builder prune --force
   docker compose build --no-cache
   docker compose up

Verifica:
- Service Registry: http://localhost:8761
- Gateway: http://localhost:8085