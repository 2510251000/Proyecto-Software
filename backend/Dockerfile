# ============================================================================
#  Al Día — imagen del backend
#  1. Compila el .jar con Maven (sin correr las pruebas: eso lo hace el CI).
#  2. Lo ejecuta con un JRE 17 liviano, sin las herramientas de compilación.
#  La configuración llega por variables de entorno, igual que con el .env.
# ============================================================================

FROM maven:3.9-eclipse-temurin-17 AS compilacion
WORKDIR /app

# Primero solo el pom.xml: si las dependencias no cambian, Docker reutiliza esta capa.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# No correr como root dentro del contenedor.
RUN addgroup -S aldia && adduser -S aldia -G aldia
USER aldia

COPY --from=compilacion /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
