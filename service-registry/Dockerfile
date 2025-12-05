FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .
COPY service-registry/build.gradle.kts service-registry/
COPY service-registry/src service-registry/src
RUN chmod +x gradlew && ./gradlew :service-registry:bootJar --no-daemon

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/service-registry/build/libs/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
