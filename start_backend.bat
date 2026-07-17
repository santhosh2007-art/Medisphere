@echo off
echo ===================================================
echo   MediSphere Patient 360 - Backend Bootstrapper
echo ===================================================
echo.

echo [1/10] Starting Discovery Service (Eureka Registry)...
start "Discovery Service" /min cmd /c "cd discoveryservice && .\mvnw spring-boot:run"
echo Waiting for Eureka to initialize...
timeout /t 10 /nobreak >nul

echo [2/10] Starting Gateway Service (Port 8080)...
start "Gateway Service" /min cmd /c "cd gatewayservice && .\mvnw spring-boot:run"
timeout /t 5 /nobreak >nul

echo [3/10] Starting Patient Service (Port 8081)...
start "Patient Service" /min cmd /c "cd patientservice && .\mvnw spring-boot:run"

echo [4/10] Starting Health Twin Service (Port 8082)...
start "Health Twin Service" /min cmd /c "cd healthtwinservice && .\mvnw spring-boot:run"

echo [5/10] Starting Vitals Service (Port 8083)...
start "Vitals Service" /min cmd /c "cd vitalsservice && .\mvnw spring-boot:run"

echo [6/10] Starting Consent Service (Port 8084)...
start "Consent Service" /min cmd /c "cd consentservice && .\mvnw spring-boot:run"

echo [7/10] Starting FHIR Service (Port 8085)...
start "FHIR Service" /min cmd /c "cd fhirservice && .\mvnw spring-boot:run"

echo [8/10] Starting AI Prediction Service (Port 8086)...
start "AI Prediction Service" /min cmd /c "cd ai-prediction-service && .\mvnw spring-boot:run"

echo [9/10] Starting Explainability Service (Port 8087)...
start "Explainability Service" /min cmd /c "cd explainability-service && .\mvnw spring-boot:run"

echo [10/10] Starting Model Management Service (Port 8088)...
start "Model Management Service" /min cmd /c "cd model-management-service && .\mvnw spring-boot:run"

echo.
echo ===================================================
echo   All backend microservices have been initialized!
echo   Please wait 30-45 seconds for Eureka discovery
echo   registrations to complete before using the web app.
echo ===================================================
pause
