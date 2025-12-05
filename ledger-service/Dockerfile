FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY ledger-service ledger-service
RUN ./gradlew :ledger-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/ledger-service/build/libs/ledger-service-*.jar /app/ledger-service.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/ledger-service.jar"]
