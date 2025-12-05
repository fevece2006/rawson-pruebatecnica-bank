FROM gradle:8.4.3-jdk21 AS build
WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .
RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=build/libs/*.jar
COPY --from=build /home/gradle/project/${JAR_FILE} /app/app.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","/app/app.jar"]
