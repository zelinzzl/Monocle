
# Frontend Tests

This project includes both end-to-end (E2E) and integration tests using Cypress.

## Directory Structure

```
cypress/
├── e2e/
│   ├── integration-tests/     # Integration-style tests (e.g. API, isolated logic)
│   └── e2e-tests/             # Full end-to-end UI tests
│   └── fixtures/ 
│   └── support/   
```

## Run Integration Tests

```bash
npx cypress run --spec "cypress/e2e/integration-tests/**/*.cy.ts"
```

## Run End-to-End Tests

```bash
npx cypress run --spec "cypress/e2e/e2e-tests/**/*.cy.ts"
```


## Run both Integration and End-to-End Tests

```bash
npx cypress run --e2e
```
