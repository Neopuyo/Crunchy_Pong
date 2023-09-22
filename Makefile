# ************************** Makefile Transcendence ************************** #

DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_FILE = ./docker-compose.yml
ENV_FILE = .env
BUILD=build
DEV=dev

.phony : all local dev devip start down rmvolume rmNodeModules rmNetwork clean fclean refront reback redata re relocal redev redevip ipAddress write-env-ip write-env-localhost write-env-dev write-env-build install-deps

# ******************************** IP ADDRESS ******************************** #

HOST_IP := $(shell bash ./tools/get_host_ip.sh)
export HOST_IP

# *********************************** RULES ********************************** #

all : 
	@echo "----Starting Production Servers with IP----"
	@make write-env-ip
	@make write-env-build
	@make start
	@echo "ipAddress: $(HOST_IP)"

env : 
	@echo "----Writing IP address in .env file----"
	@make write-env-ip
	@make write-env-build
	@echo "ipAddress: $(HOST_IP)"

local	: 
	@echo "----Starting Production Servers in Localhost----"
	@make write-env-localhost
	@make write-env-build
	@make start

dev	: 
	@echo "----Starting Development Servers in Localhost----"
	@make write-env-localhost
	@make write-env-dev
	@make start

devip	: 
	@echo "----Starting Development Servers with IP----"
	@make write-env-ip
	@make write-env-dev
	@make start
	@echo "ipAddress: $(HOST_IP)"

start :
	@echo "----Starting all Docker----"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d --build
	@echo "----All Docker started-----"

down :
	@echo "----Stopping all Docker----"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) stop -t 1
	@echo "----All Docker stopped-----"

rmvolume :
	@echo "----Deleting all Volumes----"
	@volumes=$$(docker volume ls -q); \
	if [ -n "$$volumes" ]; then \
		docker volume rm $$volumes; \
	else \
		echo "No volumes to remove."; \
	fi
	rm -rf ./workspaces/Backend/db/migrations
	@echo "----All Volumes deleted-----"

rmNodeModules :
	@echo "----Deleting all node_modules----"
	rm -rf node_modules
	rm -rf yarn.lock
	rm -rf workspaces/Backend/dist
	rm -rf workspaces/Backend/logs
	rm -rf workspaces/Backend/node_modules
	rm -rf workspaces/Frontend/node_modules
	rm -rf workspaces/Frontend/.next
	@echo "----All node_modules deleted-----"

rmNetwork :
	@echo "----Deleting all Networks----"
	@networks=$$(docker network ls --format "{{.Name}}" | grep -Ev "^bridge$$|^host$$|^none$$"); \
	if [ -n "$$networks" ]; then \
		docker network rm $$networks; \
	else \
		echo "No networks to remove."; \
	fi
	@echo "----All Networks deleted-----"

clean : down
	@echo "----Cleaning all Docker----"
	@containers=$$(docker ps -qa); \
	if [ "$$containers" ]; then \
		docker rm $$containers; \
	else \
		echo "No containers to remove."; \
	fi
	@images=$$(docker images -qa); \
	if [ "$$images" ]; then \
		docker rmi -f $$images; \
	else \
		echo "No images to remove."; \
	fi
	@echo "----All Docker cleaned-----"

fclean :
	@echo "----Full Cleaning all Docker----"
	make clean
	make rmNodeModules
	make rmvolume
	make rmNetwork
	docker system prune -a
	@echo "----All Docker fully cleaned-----"

refront :
	@echo "----Restarting Frontend----"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart frontend

reback :
	@echo "----Restarting Backend-----"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart backend

redata :
	@echo "----Restarting Database----"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart database

re : clean all

relocal : clean local

redev : clean dev

redevip : clean devip

ipAddress:
	@echo "Host IP: $(HOST_IP)"

URL_42=https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2388167488ff2dea9fc1c06d0ce731ea5893103cfe4e8030283af04f9c46f9e4&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2F42&response_type=code

write-env-ip:
	@if [ -f $(ENV_FILE) ]; then \
		if grep -q "HOST_IP=" $(ENV_FILE); then \
			grep -v "HOST_IP=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "HOST_IP=$(HOST_IP)" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		if grep -q "REDIRECT_42=" $(ENV_FILE); then \
			grep -v "REDIRECT_42=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "REDIRECT_42=http://$(HOST_IP):4000/api/auth/42" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		if grep -q "URL_42=" $(ENV_FILE); then \
			grep -v "URL_42=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "URL_42=https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2388167488ff2dea9fc1c06d0ce731ea5893103cfe4e8030283af04f9c46f9e4&redirect_uri=http%3A%2F%2F$(HOST_IP)%3A4000%2Fapi%2Fauth%2F42&response_type=code" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		echo "Updated IP address in $(ENV_FILE) file"; \
	else \
		echo "HOST_IP=$(HOST_IP)" >> $(ENV_FILE); \
		echo "REDIRECT_42=http://$(HOST_IP):4000/api/auth/42" >> $(ENV_FILE); \
		echo "Created IP address in $(ENV_FILE) file"; \
	fi

write-env-localhost:
	@if [ -f $(ENV_FILE) ]; then \
		if grep -q "HOST_IP=" $(ENV_FILE); then \
			grep -v "HOST_IP=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "HOST_IP=localhost" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		if grep -q "REDIRECT_42=" $(ENV_FILE); then \
			grep -v "REDIRECT_42=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "REDIRECT_42=http://localhost:4000/api/auth/42" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		if grep -q "URL_42=" $(ENV_FILE); then \
			grep -v "URL_42=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "URL_42=https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2388167488ff2dea9fc1c06d0ce731ea5893103cfe4e8030283af04f9c46f9e4&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2F42&response_type=code" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		echo "Updated IP address to localhost in $(ENV_FILE) file"; \
	else \
		echo "HOST_IP=localhost" >> $(ENV_FILE); \
		echo "REDIRECT_42=http://localhost:4000/api/auth/42" >> $(ENV_FILE); \
		echo "Created IP address in $(ENV_FILE) file"; \
	fi

write-env-dev:
	@if [ -f $(ENV_FILE) ]; then \
		if grep -q "ENVIRONNEMENT=" $(ENV_FILE); then \
			grep -v "ENVIRONNEMENT=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "ENVIRONNEMENT=$(DEV)" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		echo "Updated ENVIRONNEMENT to $(DEV) in $(ENV_FILE) file"; \
	else \
		echo "ENVIRONNEMENT=$(DEV)" >> $(ENV_FILE); \
		echo "Created ENVIRONNEMENT=$(DEV) in $(ENV_FILE) file"; \
	fi

write-env-build:
	@if [ -f $(ENV_FILE) ]; then \
		if grep -q "ENVIRONNEMENT=" $(ENV_FILE); then \
			grep -v "ENVIRONNEMENT=" $(ENV_FILE) > $(ENV_FILE).tmp; \
			mv $(ENV_FILE).tmp $(ENV_FILE); \
		fi; \
		echo "ENVIRONNEMENT=$(BUILD)" | cat - $(ENV_FILE) > $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		echo "Updated ENVIRONNEMENT to $(BUILD) in $(ENV_FILE) file"; \
	else \
		echo "ENVIRONNEMENT=$(BUILD)" >> $(ENV_FILE); \
		echo "Created ENVIRONNEMENT=$(BUILD) in $(ENV_FILE) file"; \
	fi

install-deps:
	@echo "----Downloading Project Dependencies----"
	@if [ ! -d "node_modules" ]; then \
		yarn cache clean; \
		yarn install; \
		yarn install --check-files; \
	fi
