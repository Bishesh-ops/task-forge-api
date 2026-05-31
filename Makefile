DOCKER_COMPOSE = docker compose
APP_NAME = task-forge-api
dev:
	bun run --hot src/index.ts
test:
	DATABASE_URL="file:./test.db" bun test tests/integration.test.ts
db-reset:
	bunx prisma migrate reset --force
generate:
	bunx prisma generate
up:
	$(DOCKER_COMPOSE) up -d --build
down:
	$(DOCKER_COMPOSE) down
logs:
	$(DOCKER_COMPOSE) logs -f api
clean: down
	docker rmi $(APP_NAME) || true
	docker system prune -f
test:
	DATABASE_URL="file:./test.db" bun test tests/integration.test.ts
traffic:
	bun run scripts/traffic.ts
