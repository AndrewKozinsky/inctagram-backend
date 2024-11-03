## Description

Backend part for an Instagram clone website.

## Run and build a server

```bash
# Build on a server
$ yarn run build:main

# Run built program on a server
$ yarn run start:main

# Run in development mode
$ yarn run start:dev

# Debug in development mode
$ yarn run start:debug
```

## Run tests

```bash

# Run unit and integration tests
$ yarn run test

# Run unit and integration tests in watch mode
$ yarn run test:watch

# Run e2e tests
$ yarn run test:e2e
```

## Run database migration in development mode

```bash
# Create prisma config file from apps/db/dbConfig/dbConfig
$ yarn run generatePrismaFile

# Create database migration in development mode
$ yarn run migrate:dev

# Create database types after database migration
$ yarn run migrate:generate-types
```

## Run database migration in publish mode
Change value POSTGRES_DB_URL in .env
from
```
postgres://user:123@localhost:5432/inctagram
```
to
```
postgresql://blogs_owner:ybZpRe4Es5oA@ep-curly-voice-a2q1fh7d.eu-central-1.aws.neon.tech/blogs?sslmode=require
```
Run 
```bash
yarn run migrate:deploy
```
This will apply all your pending migrations to the Neon.tech database.

## How to publish new code
If you created a new microservice make sure that package.json contains commands
```
"build:paiments": "nest build paiments",
"start:paiments": "nest start paiments",
```
paiments is mean name of the microservice.

And a folder with the microservice has contain this files from Incubator personal account:
```
deployment, preparingDeploy, Jenkinsfile and Dockerfile.
```
To publish the code to the server make a Pull Request and leave a comment with text
```
run build production payments
```
The last word in a comment means a microservice name which will be published.
