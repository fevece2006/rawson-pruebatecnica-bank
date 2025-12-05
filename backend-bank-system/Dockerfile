# Dockerfile multi-stage usando Gradle Wrapper si está disponible, fallback a gradle del contenedor.
FROM gradle:8.4.3-jdk21 AS build
WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .

# Si el wrapper está presente, lo usamos; sino usamos gradle (imagen ya lo contiene)
RUN if [ -f ./gradlew ]; then chmod +x ./gradlew && ./gradlew clean bootJar --no-daemon; else gradle clean bootJar --no-daemon; fi

FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=build/libs/*.jar
COPY --from=build /home/gradle/project/${JAR_FILE} /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
