FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY build/libs/ledger-service.jar /app/ledger-service.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/ledger-service.jar"]
