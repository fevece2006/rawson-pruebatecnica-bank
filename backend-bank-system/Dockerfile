# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

# Copy gradle wrapper and configuration files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Copy all service build files for multi-project setup
COPY api-gateway/build.gradle.kts api-gateway/
COPY backend-bank-system/build.gradle.kts backend-bank-system/
COPY ledger-service/build.gradle.kts ledger-service/
COPY orchestrator-service/build.gradle.kts orchestrator-service/
COPY service-registry/build.gradle.kts service-registry/

# Copy service-specific source files
COPY backend-bank-system/src backend-bank-system/src

# Build the project
RUN chmod +x gradlew && ./gradlew :backend-bank-system:bootJar --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/backend-bank-system/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
