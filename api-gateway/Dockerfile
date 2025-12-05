FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .
COPY api-gateway/build.gradle.kts api-gateway/
COPY api-gateway/src api-gateway/src
RUN chmod +x gradlew && ./gradlew :api-gateway:bootJar --no-daemon

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
