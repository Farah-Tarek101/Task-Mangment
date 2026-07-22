.PHONY: install build dev start test test-unit test-integration migrate seed docker-up docker-down clean

install:
	npm install

build:
	npm run build

dev:
	npm run dev

start:
	npm start

test:
	npm test

test-unit:
	npm run test:unit

test-integration:
	npm run test:integration

migrate:
	npm run migrate:up

migrate-down:
	npm run migrate:down

seed:
	npm run seed

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

clean:
	rm -rf node_modules coverage
