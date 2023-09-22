FROM debian:latest

RUN apt-get update
RUN apt-get install -y \
	postgresql-15 \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

COPY ./Dockers/Database/tools/start_db.sh /
RUN chmod +x start_db.sh

USER postgres

EXPOSE 5432
ENTRYPOINT ["./start_db.sh"]
