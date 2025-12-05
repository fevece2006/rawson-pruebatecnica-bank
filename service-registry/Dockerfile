FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY service-registry service-registry
RUN ./gradlew :service-registry:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/service-registry/build/libs/service-registry-*.jar /app/service-registry.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","/app/service-registry.jar"]
