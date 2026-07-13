# MediSphere — Fixed & Working Version

MediSphere is a small Spring Boot microservices project for a healthcare
"Patient 360" dashboard. It is made of 7 independent Spring Boot
applications:

| Service            | Port | Purpose                                   |
|---------------------|------|--------------------------------------------|
| discoveryservice     | 8761 | Eureka service registry                    |
| gatewayservice       | 8080 | API Gateway + OAuth2 (Resource Server)     |
| patientservice       | 8081 | Patient CRUD, Patient 360, Audit Log       |
| healthtwinservice    | 8082 | Health Twin (blood group, height, weight…) |
| vitalsservice        | 8083 | Vitals + Kafka wearable-data streaming     |
| consentservice       | 8084 | Consent management                         |
| fhirservice          | 8085 | FHIR-compatible resource conversion        |

There is no root/parent `pom.xml` — each folder is its own standalone Maven
project, so each one is built and run separately.

---

## 1. Issues found and fixed

### Compilation / build errors
1. **discoveryservice — class/file/package mismatch.** The main class was
   package-private and named `DiscoveryServerApplication` while the file was
   `DiscoveryServiceApplication.java`, and the test class was declared in a
   different package (`com.infosys.discovery_service` instead of
   `com.infosys.discoveryservice`). This made the Spring Boot test fail to
   find the application context. Renamed the class to `public class
   DiscoveryServiceApplication` and corrected the test's package.
2. **gatewayservice — conflicting Gateway dependencies.** The POM pulled in
   both `spring-cloud-starter-gateway-server-webflux` **and** the older
   aggregate `spring-cloud-starter-gateway`, which can pull in duplicate/
   conflicting auto-configuration. Removed the redundant dependency and kept
   only the reactive (WebFlux) starter, which matches the reactive filters
   (`Mono`, `ServerWebExchange`) already used in the code.
3. **Inconsistent Spring Boot / Spring Cloud versions across modules.** Some
   services used Spring Boot `3.5.4` / Spring Cloud `2025.0.0`, others used
   `3.5.16` / `2025.0.3`. Standardised all 7 modules on the same versions to
   avoid subtle compatibility issues.

### Configuration / runtime errors
4. **Gateway route missing for the Patient 360 dashboard and Audit Log.**
   Only `/patient/**` was routed to `patient-service`, so `/patient360/**`
   and the new `/audit/**` endpoints were unreachable through the gateway.
   Added dedicated routes for both.
5. **OAuth2 issuer URL used a port already taken by fhirservice.** The
   gateway's `issuer-uri` pointed at `http://localhost:8085/...`, which is
   the exact port `fhirservice` listens on — the two would collide. There
   was also no actual authorization server anywhere in the project, so every
   request through the gateway would fail. Moved the (new) Keycloak
   container to port **8181** and added a ready-to-use realm
   (`keycloak/realm-export.json`) plus a `docker-compose.yml` entry so the
   OAuth2 flow actually works end-to-end.
6. **Patient360Service had no error handling.** Every call to the other
   microservices used `restTemplate.getForObject(...)` with no try/catch. If
   any one dependent service was down or a record didn't exist yet (e.g. no
   consent record created), the whole Patient 360 call threw an unhandled
   exception. Wrapped each downstream call so the dashboard degrades
   gracefully instead of failing outright.

### Missing Milestone 1 features
7. **Kafka was completely absent** even though it's a required concept.
   Added `spring-kafka` to `vitalsservice`, a producer/consumer pair, and a
   `/vitals/wearable/publish` endpoint that simulates a wearable device
   streaming a vitals reading through Kafka; the consumer saves it to
   MongoDB automatically.
8. **No consent verification before returning sensitive data.**
   `Patient360Service` used to fetch and return Health Twin and Vitals data
   unconditionally. It now calls consent-service first and only includes
   sensitive data when consent `status` is `GRANTED`; otherwise it returns a
   clear message explaining why the data was withheld.
9. **No audit logging anywhere.** Added an `AuditLog` Mongo collection, an
   `AuditService`, and an `/audit/{patientId}` endpoint in `patientservice`.
   Patient create/update/delete and every Patient 360 view (granted or
   denied) are now recorded and shown as part of the dashboard response.
10. **FHIR support was just placeholder text.** `fhirservice` only returned
    canned strings ("Connected to FHIR Server", etc.) with no real FHIR data
    shapes. Added simplified FHIR R4 datatypes (`FhirPatientResource`,
    `FhirHumanName`, `FhirContactPoint`, `FhirAddress`) and a new
    `GET /fhir/patient/{id}` endpoint that fetches a patient from
    `patientservice` and returns it as a FHIR-compatible `Patient` resource.

### Cleanup
11. Removed committed `target/` build output and `.idea/` IDE folders — these
    should never be shipped with source code and were bloating the archive.

---

## 2. Project structure (per service)

Each service keeps the same layout it already had:
`Controller / Service / Repository / Entity / dto / Exception`, plus a new
`config` / `kafka` package in `vitalsservice` for the Kafka wiring, and new
`Entity` / `Repository` / `Service` / `Controller` classes in
`patientservice` for the audit trail.

---

## 3. How to run it locally

### Step 1 — Start infrastructure (MongoDB, Kafka, Keycloak)
From the project root:
```bash
docker compose up -d
```
This starts:
- MongoDB on `localhost:27017`
- Kafka (+ Zookeeper) on `localhost:9092`
- Keycloak on `localhost:8181` (admin console: `admin` / `admin`), pre-loaded
  with a `medisphere` realm, a public client `medisphere-client`, and a test
  user `testuser` / `password123`.

### Step 2 — Start the microservices (in this order)
Each service is independent — open a terminal per service, or run each from
your IDE:
```bash
cd discoveryservice   && ./mvnw spring-boot:run   # 8761 - start first
cd patientservice     && ./mvnw spring-boot:run   # 8081
cd healthtwinservice  && ./mvnw spring-boot:run   # 8082
cd vitalsservice      && ./mvnw spring-boot:run   # 8083
cd consentservice     && ./mvnw spring-boot:run   # 8084
cd fhirservice        && ./mvnw spring-boot:run   # 8085
cd gatewayservice     && ./mvnw spring-boot:run   # 8080 - start last
```
Give the discovery service ~10 seconds to start before the others, so they
can register with Eureka.

### Step 3 — Get an OAuth2 access token (SMART on FHIR / OAuth2)
```bash
curl -X POST http://localhost:8181/realms/medisphere/protocol/openid-connect/token \
  -d "client_id=medisphere-client" \
  -d "grant_type=password" \
  -d "username=testuser" \
  -d "password=password123"
```
Copy the `access_token` from the response.

### Step 4 — Call the APIs through the gateway
All calls below go through the gateway (`http://localhost:8080`) and require
`Authorization: Bearer <access_token>`.

```bash
TOKEN="<paste access_token here>"

# Create a patient
curl -X POST http://localhost:8080/patient/save \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"firstname":"Jane","lastname":"Doe","gender":"F","dob":"1990-01-01","email":"jane@example.com","phoneno":9999999999,"address":"Mumbai"}'

# Grant consent (use the patientId returned above)
curl -X POST http://localhost:8080/consent/save \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"patientId":"<patientId>","consenttype":"FULL_ACCESS","status":"GRANTED","granteddate":"2026-07-01","expirydate":"2027-07-01"}'

# Add a health twin record
curl -X POST http://localhost:8080/healthtwin/save \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"patientId":"<patientId>","bloodgroup":"O+","height":170,"weight":65,"temperature":98.6,"disease":"None"}'

# Simulate a wearable device streaming a vitals reading through Kafka
curl -X POST http://localhost:8080/vitals/wearable/publish \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"patientId":"<patientId>","heartbeat":78,"bloodpressure":"120/80","oxygenlevel":98,"bloodsuger":95,"pulserate":76}'

# View the full Patient 360 dashboard
curl http://localhost:8080/patient360/<patientId> -H "Authorization: Bearer $TOKEN"

# View the audit trail
curl http://localhost:8080/audit/<patientId> -H "Authorization: Bearer $TOKEN"

# Get the patient as a FHIR resource
curl http://localhost:8080/fhir/patient/<patientId> -H "Authorization: Bearer $TOKEN"
```

---

## 4. Milestone 1 feature checklist

| Feature                     | Where it lives                                          | Status |
|------------------------------|-----------------------------------------------------------|--------|
| FHIR                         | `fhirservice` — `FhirPatientResource` + `/fhir/patient/{id}` | Done |
| SMART on FHIR (OAuth2)       | `gatewayservice` (Resource Server) + Keycloak (Authorization Server) | Done |
| Kafka streaming              | `vitalsservice` — `WearableDataProducer` / `WearableDataConsumer` | Done |
| MongoDB CRUD                 | Every service uses `MongoRepository` for its own collection | Done |
| Consent management            | `consentservice` + consent check in `Patient360Service`  | Done |
| Audit logging                | `AuditLog` entity + `AuditService` in `patientservice`    | Done |
| Patient 360 dashboard         | `Patient360Controller` / `Patient360Service` in `patientservice` | Done |

### Known simplifications (intentional, for a Milestone 1 / student project)
- Only the **gateway** validates OAuth2 tokens. The individual services trust
  traffic coming through the gateway and do not re-check the token
  themselves — this keeps each service simple, at the cost of not being a
  true zero-trust setup.
- `Patient360Service` looks up the other services via hardcoded
  `localhost:PORT` URLs rather than through Eureka/`lb://`, matching how the
  original code was written. This works fine when everything runs on one
  machine, but would need to switch to a `@LoadBalanced RestTemplate` (or
  `WebClient` + `lb://`) for a real multi-instance deployment.
- Consent status is treated as valid when it equals `"GRANTED"` (case
  insensitive) — make sure to use that exact value when testing consent.
