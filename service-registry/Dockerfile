FROM eclipse-temurin:21-jdk AS build
WORKDIR /home/project

# Copiar todo el proyecto (necesario para multi-módulo)
COPY . .

# Normalizar line endings y permisos
RUN sed -i 's/\r$//' ./gradlew && chmod +x ./gradlew

# Configurar Gradle para mejor manejo de red
RUN mkdir -p ~/.gradle && \
    echo "org.gradle.daemon=false" >> ~/.gradle/gradle.properties && \
    echo "org.gradle.parallel=false" >> ~/.gradle/gradle.properties && \
    echo "org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m" >> ~/.gradle/gradle.properties && \
    echo "systemProp.https.protocols=TLSv1.2,TLSv1.3" >> ~/.gradle/gradle.properties && \
    echo "org.gradle.java.home=/opt/java/openjdk" >> ~/.gradle/gradle.properties

# Build con timeout extendido y reintentos
RUN --mount=type=cache,target=/root/.gradle \
    for i in 1 2 3 4 5; do \
      echo "Build attempt $i..." && \
      ./gradlew clean :service-registry:bootJar --no-daemon --refresh-dependencies --stacktrace && break || \
      (echo "Attempt $i failed, retrying in 15 seconds..." && sleep 15); \
    done

FROM eclipse-temurin:21-jre-jammy
ARG JAR_FILE=service-registry/build/libs/*.jar
COPY --from=build /home/project/${JAR_FILE} /app/app.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","/app/app.jar"]