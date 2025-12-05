plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

val camelVersion = "4.4.0"

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.kafka:spring-kafka")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.1.0")
    compileOnly("org.projectlombok:lombok:1.18.30")
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("com.h2database:h2")
    annotationProcessor("org.projectlombok:lombok:1.18.30")

    // Camel & additional components
    implementation("org.apache.camel.springboot:camel-spring-boot-starter:$camelVersion")
    implementation("org.apache.camel:camel-kafka:$camelVersion")
    implementation("org.apache.camel:camel-jackson:$camelVersion")
    implementation("org.apache.camel:camel-debezium-postgres:$camelVersion")
    implementation("org.apache.camel:camel-saga:$camelVersion")
    implementation("org.apache.camel:camel-jdbc:$camelVersion")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2023.0.0")
    }
}
