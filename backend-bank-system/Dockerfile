# Build stage con JDK 21 usando wrapper desde la raíz
FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/project

# Copiar wrapper explícitamente desde la raíz para asegurar que esté en el contexto
COPY gradlew gradlew.bat ./
COPY gradle/wrapper/ gradle/wrapper/

# Copiar todo el repo (incluye el submódulo backend-bank-system)
COPY . .

# Convert CRLF to LF (in case files were checked out on Windows) and build
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew && ./gradlew clean :backend-bank-system:bootJar --no-daemon

# Runtime con JRE 21
FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=backend-bank-system/build/libs/*.jar
COPY --from=build /home/project/${JAR_FILE} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]