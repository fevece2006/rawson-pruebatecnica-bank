FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .
COPY backend-bank-system/build.gradle.kts backend-bank-system/
COPY backend-bank-system/src backend-bank-system/src
RUN chmod +x gradlew && ./gradlew :backend-bank-system:bootJar --no-daemon

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/backend-bank-system/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
