# Build stage con JDK 21 y uso del Gradle Wrapper desde el contexto raíz
FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/project

# Copiar explícitamente el wrapper y su carpeta (asegura que estén disponibles dentro del contexto)
COPY gradlew gradlew.bat ./
COPY gradle/wrapper/ gradle/wrapper/

# Copiar todo el repo al contexto de build (incluye el subproyecto backend-bank-system)
COPY . .

# Ejecutar build solo del subproyecto (usa path de Gradle: :backend-bank-system:bootJar)
RUN chmod +x ./gradlew && ./gradlew clean :backend-bank-system:bootJar --no-daemon

# Runtime con JRE 21
FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=backend-bank-system/build/libs/*.jar
COPY --from=build /home/project/${JAR_FILE} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]