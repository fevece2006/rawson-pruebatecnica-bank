FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY build/libs/orchestrator-service.jar /app/orchestrator-service.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/orchestrator-service.jar"]
