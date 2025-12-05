FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY build/libs/service-registry.jar /app/service-registry.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","/app/service-registry.jar"]
