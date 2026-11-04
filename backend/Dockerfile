# Step 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Limit Maven JVM memory so it stays well within Render free-tier RAM (512MB)
ENV MAVEN_OPTS="-Xmx256m -XX:+UseSerialGC"

COPY pom.xml ./
COPY src ./src

# Build package, skipping tests and lowering memory usage
RUN mvn clean package -DskipTests -Dmaven.test.skip=true -Dspring-boot.repackage.skip=false -e

# Step 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Run Java with minimal memory footprint suited for 512MB
ENV JAVA_OPTS="-Xmx300m -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]