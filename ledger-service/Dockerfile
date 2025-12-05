FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/project

COPY gradlew gradlew.bat ./
COPY gradle/wrapper/ gradle/wrapper/
COPY . .

RUN chmod +x ./gradlew && ./gradlew clean :ledger-service:bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=ledger-service/build/libs/*.jar
COPY --from=build /home/project/${JAR_FILE} /app/app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]