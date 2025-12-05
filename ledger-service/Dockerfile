FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .
COPY ledger-service/build.gradle.kts ledger-service/
COPY ledger-service/src ledger-service/src
RUN chmod +x gradlew && ./gradlew :ledger-service:bootJar --no-daemon

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/ledger-service/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
