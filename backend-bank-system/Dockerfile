# Build stage using Gradle with JDK 17
FROM gradle:7.6-jdk17 AS build
WORKDIR /home/project

# Copy Gradle wrapper and config from root
COPY gradlew gradlew.bat ./
COPY gradle/wrapper/ gradle/wrapper/
COPY build.gradle settings.gradle ./

# Copy backend-bank-system subproject
COPY backend-bank-system/ backend-bank-system/

# Build the project (skip tests)
RUN gradle :backend-bank-system:bootJar -x test --no-daemon

# Runtime stage with JRE 17
FROM eclipse-temurin:17-jre
COPY --from=build /home/project/backend-bank-system/build/libs/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]