plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.0"
    java
}

group = "com.rawson.gateway"
version = "0.0.1"
java.sourceCompatibility = JavaVersion.VERSION_21

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.cloud:spring-cloud-starter-gateway")
    implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-client")
    implementation("io.github.resilience4j:resilience4j-reactor:2.1.0")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

dependencyManagement {
    imports { mavenBom("org.springframework.cloud:spring-cloud-dependencies:2022.0.3") }
}
