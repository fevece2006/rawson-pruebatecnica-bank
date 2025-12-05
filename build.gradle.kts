plugins {
    id("org.springframework.boot") version "3.2.0" apply false
    id("io.spring.dependency-management") version "1.1.0" apply false
}

allprojects {
    group = "com.rawson"
    version = "0.0.1"

    repositories {
        mavenCentral()
    }
}
