# Build stage
FROM gradle:8.4-jdk17 AS build
WORKDIR /home/app
COPY . .
# Evitamos ejecutar tests en la imagen por rapidez; quítalo si quieres ejecutar tests
RUN gradle clean bootJar -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
# Ajusta la ruta según el nombre real del jar generado
COPY --from=build /home/app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
