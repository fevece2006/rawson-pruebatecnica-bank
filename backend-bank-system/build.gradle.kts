plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.0"
    java
}

group = "com.rawson"
version = "0.0.1"
java.sourceCompatibility = JavaVersion.VERSION_21

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.kafka:spring-kafka")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.1.0")
    implementation("org.projectlombok:lombok:1.18.28")
    runtimeOnly("org.postgresql:postgresql")
    annotationProcessor("org.projectlombok:lombok:1.18.28")

    // Camel & additional components
    implementation("org.apache.camel.springboot:camel-spring-boot-starter:4.1.2")
    implementation("org.apache.camel:camel-kafka:4.1.2")
    implementation("org.apache.camel:camel-jackson:4.1.2")
    implementation("org.apache.camel:camel-debezium-postgres:4.1.2")
    implementation("org.apache.camel:camel-saga:4.1.2")
    implementation("org.apache.camel:camel-jdbc:4.1.2")
}

tasks.register<Copy>("copyJar") {
    dependsOn("bootJar")
    from(layout.buildDirectory.file("libs/${project.name}-${project.version}.jar"))
    into(layout.projectDirectory)
    rename { "backend-bank-system.jar" }
}
