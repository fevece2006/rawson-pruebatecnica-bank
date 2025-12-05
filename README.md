```markdown
# rawson-pruebatecnica-bank

Migración a Gradle (Java 21), Docker y CI (GitHub Actions).

Pasos locales:

1. Generar o usar el Gradle wrapper:
   - Si no está incluido: ./gradlew wrapper
2. Compilar todo:
   - ./gradlew clean build
3. Levantar con Docker Compose:
   - docker-compose up --build
4. Verifica:
   - Service Registry: http://localhost:8761
   - Gateway: http://localhost:8085

CI:
- Se añade .github/workflows/ci.yml que ejecuta ./gradlew clean build con Java 21.

Notas:
- Ajusta puertos y variables de entorno en docker-compose.yml según tus preferencias.
- Revisa versiones de dependencias Spring Cloud/Eureka para compatibilidad con Spring Boot y Java 21.
```
