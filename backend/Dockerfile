FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the pre-built jar from your local build
COPY target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx380m", "-jar", "app.jar"]