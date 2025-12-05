FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/project

COPY gradlew gradlew.bat ./
COPY gradle/wrapper/ gradle/wrapper/
COPY . .

# Convert CRLF to LF (in case files were checked out on Windows) and build
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew && ./gradlew clean :orchestrator-service:bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=orchestrator-service/build/libs/*.jar
COPY --from=build /home/project/${JAR_FILE} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]