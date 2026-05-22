# ─── Build stage ─────────────────────────────────────────────────────────────
# Compiles the Spring Boot JAR using Maven + Java 21.
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Pre-fetch dependencies first so subsequent rebuilds are cached when only src/ changes.
COPY pom.xml ./
RUN mvn -B dependency:go-offline

# Now copy the actual sources and build.
COPY src ./src
RUN mvn -B clean package -DskipTests

# ─── Runtime stage ───────────────────────────────────────────────────────────
# Slimmer image: JRE only, no Maven, no source.
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render (and most platforms) inject a PORT env var. Spring Boot reads it via
# SERVER_PORT in application.properties — the default of 8083 is used locally.
EXPOSE 8083

# Use exec form so JVM is PID 1 and receives signals (graceful shutdown).
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8083}"]
