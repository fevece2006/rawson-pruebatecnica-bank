plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.0"
    java
}

group = "com.rawson.registry"
version = "0.0.1"
java.sourceCompatibility = JavaVersion.VERSION_21

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.cloud:spring-cloud-starter-netflix-eureka-server:4.0.3")
    implementation("org.springframework.boot:spring-boot-starter-web")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2022.0.3")
    }
}
