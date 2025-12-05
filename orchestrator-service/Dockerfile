FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY orchestrator-service orchestrator-service
RUN ./gradlew :orchestrator-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/orchestrator-service/build/libs/orchestrator-service-*.jar /app/orchestrator-service.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/orchestrator-service.jar"]
