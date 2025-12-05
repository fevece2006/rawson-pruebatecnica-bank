FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY build/libs/backend-bank-system.jar /app/backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/backend.jar"]
