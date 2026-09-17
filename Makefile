DOCKER_COMPOSE = docker compose
APP_NAME = task-forge-api
API_DIR = api
DATABASE_URL ?= file:./dev.db
JWT_SECRET ?= a_long_very_random_secret_string_for_development

export DATABASE_URL JWT_SECRET

dev: generate migrate
	cd $(API_DIR) && bun run --hot src/index.ts

db-reset:
	cd $(API_DIR) && bunx prisma migrate reset --force

generate:
	cd $(API_DIR) && bunx prisma generate

migrate:
	cd $(API_DIR) && bunx prisma migrate deploy

test:
	cd $(API_DIR) && DATABASE_URL="file:./test.db" bun test tests/integration.test.ts
up:
	$(DOCKER_COMPOSE) up -d --build
down:
	$(DOCKER_COMPOSE) down
logs:
	$(DOCKER_COMPOSE) logs -f api
clean: down
	docker rmi $(APP_NAME) || true
	docker system prune -f
traffic:
	cd $(API_DIR) && bun run scripts/traffic.ts
