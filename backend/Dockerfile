# Step 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml first to cache dependencies
COPY pom.xml ./
COPY src ./src

# Build package without running or compiling tests
RUN mvn clean package -Dmaven.test.skip=true

# Step 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]