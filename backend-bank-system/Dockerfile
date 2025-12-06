# Build stage with JDK 21
FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/project

# Copy Gradle wrapper from root
COPY gradlew gradlew.bat ./
COPY gradle/wrapper/ gradle/wrapper/

# Copy entire repo (includes backend-bank-system submodule)
COPY . .

# Set permissions and build (skip tests for faster builds)
RUN chmod +x ./gradlew && ./gradlew clean :backend-bank-system:bootJar -x test --no-daemon

# Runtime stage with JRE 21
FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=backend-bank-system/build/libs/*.jar
COPY --from=build /home/project/${JAR_FILE} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]