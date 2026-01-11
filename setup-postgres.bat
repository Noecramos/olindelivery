@echo off
echo Adding Postgres credentials to .env.local...
echo.
echo # Vercel Postgres (Neon) >> .env.local
echo POSTGRES_URL=postgresql://neondb_owner:npg_3n2fJzLMUAED@ep-spring-sky-acldmq32-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require >> .env.local
echo POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_3n2fJzLMUAED@ep-spring-sky-acldmq32-pooler.sa-east-1.aws.neon.tech/neondb?connect_timeout=15^&sslmode=require >> .env.local
echo POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_3n2fJzLMUAED@ep-spring-sky-acldmq32.sa-east-1.aws.neon.tech/neondb?sslmode=require >> .env.local
echo POSTGRES_USER=neondb_owner >> .env.local
echo POSTGRES_HOST=ep-spring-sky-acldmq32-pooler.sa-east-1.aws.neon.tech >> .env.local
echo POSTGRES_PASSWORD=npg_3n2fJzLMUAED >> .env.local
echo POSTGRES_DATABASE=neondb >> .env.local
echo.
echo ✅ Credentials added successfully!
echo.
echo Next steps:
echo 1. node database/create-schema.js
echo 2. node database/migrate.js
