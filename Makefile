.PHONY: build build-client build-server build-slides run stop

build: build-client build-server build-slides

build-client:
	cd client && npm install && npm run build

build-server:
	cd server && npm install && npm run build

build-slides:
	cd slides/slidev && npm install && npm run build

run: build
	docker compose up --build

stop:
	docker compose down
