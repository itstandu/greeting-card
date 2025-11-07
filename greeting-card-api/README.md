# Greeting Card API

A Spring Boot application for managing greeting cards.

> 📚 **For detailed documentation**, see [docs/README.md](./docs/README.md)

## Development Setup

### Prerequisites

- Java 17 or later
- Maven 3.9.6 or later
- PostgreSQL (for database)

> **Note:** Node.js is **NOT required**. Husky Git hooks are already included in the repository, so you don't need to install Node.js or run `npm install`.

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd greeting-card-api
   ```

2. **Install Maven dependencies**

   ```bash
   ./mvnw clean install
   ```

3. **Configure database**

   - Update `src/main/resources/application.yml` with your PostgreSQL connection details
   - The database schema will be automatically created by Hibernate on first run

4. **Code Formatting**

   - The project uses Spotless for code formatting
   - Format code manually: `./mvnw spotless:apply`
   - Check formatting: `./mvnw spotless:check`

5. **Git Hooks**
   - Pre-commit hook will automatically format your code before each commit
   - If formatting is needed, the hook will apply changes and ask you to commit again
   - **Husky is pre-configured** - no need to install Node.js or run `npm install`

### Running the Application

```bash
# Run the application
./mvnw spring-boot:run

# Or build and run the JAR
./mvnw clean package
java -jar target/greeting-card-api-*.jar
```

The application will start on `http://localhost:8080` (default port).

## Development Workflow

1. Make your changes
2. Commit your changes (Husky will auto-format if needed)
3. Push to your feature branch
4. Create a Pull Request

## CI/CD

GitHub Actions will automatically:

- Run tests
- Check code formatting
- Build the application

## IDE Setup

### IntelliJ IDEA

1. Enable "Reformat code on save"
2. Enable "Optimize imports on save"
3. Install the following plugins:
   - Save Actions
   - CheckStyle-IDEA
   - Spotless

### VS Code

1. Install the following extensions:
   - Prettier
   - Java Extension Pack
   - Spotless Gradle
2. Enable "Format On Save"

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
