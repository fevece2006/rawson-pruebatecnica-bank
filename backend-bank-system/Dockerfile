FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY backend-bank-system backend-bank-system
RUN ./gradlew :backend-bank-system:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/backend-bank-system/build/libs/backend-bank-system-*.jar /app/backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/backend.jar"]
