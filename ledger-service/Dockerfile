# Dockerfile multi-stage: usa Gradle Wrapper si estÃ¡ presente, fallback a gradle del contenedor.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .
RUN if [ -f ./gradlew ]; then chmod +x ./gradlew && ./gradlew clean bootJar --no-daemon; else gradle clean bootJar --no-daemon; fi

FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=build/libs/*.jar
COPY --from=build /home/gradle/project/${JAR_FILE} /app/app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
