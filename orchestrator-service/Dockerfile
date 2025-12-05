FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .
COPY orchestrator-service/build.gradle.kts orchestrator-service/
COPY orchestrator-service/src orchestrator-service/src
RUN chmod +x gradlew && ./gradlew :orchestrator-service:bootJar --no-daemon

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/orchestrator-service/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
