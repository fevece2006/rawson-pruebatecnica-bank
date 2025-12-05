FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY build/libs/api-gateway.jar /app/api-gateway.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/api-gateway.jar"]
