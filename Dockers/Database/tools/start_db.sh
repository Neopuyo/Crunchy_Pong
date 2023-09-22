#!/bin/bash

echo "Begin Database configuration"

echo "---------------Adding postgres command to path----------"
export PATH+=:/usr/lib/postgresql/15/bin

# Si premier demarage , on configure la database
if [ ! -f "/etc/postgresql/15/conf_done" ]; then
    echo "---------No database found, creating one------------"

    sed -i "s/port = .*/port = $DATA_BASE_PORT/" /etc/postgresql/15/main/postgresql.conf
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/15/main/postgresql.conf
    echo "host  all  all 0.0.0.0/0 md5" >> /etc/postgresql/15/main/pg_hba.conf

    pg_ctlcluster 15 main start || { echo "Failed to start PostgreSQL"; exit 1; }

    echo "---------------Creating user and database...---------------"
    createuser $DATA_BASE_USER
    createdb $DATA_BASE_NAME -O $DATA_BASE_USER
    psql -U $DATA_BASE_SUP_USER -c "ALTER USER $DATA_BASE_USER WITH PASSWORD '$DATA_BASE_PASSWORD';"
    psql -U $DATA_BASE_SUP_USER -c "ALTER USER $DATA_BASE_SUP_USER WITH PASSWORD '$DATA_BASE_SUP_PW';"
    psql -U $DATA_BASE_SUP_USER -c "GRANT ALL PRIVILEGES ON DATABASE $DATA_BASE_NAME TO $DATA_BASE_USER;"
    psql -U $DATA_BASE_SUP_USER -c "GRANT ALL PRIVILEGES ON DATABASE $DATA_BASE_NAME TO $DATA_BASE_SUP_USER;"
    echo "---------------Database configured!------------------"

    pg_ctlcluster 15 main stop || { echo "Failed to stop PostgreSQL"; exit 1; }

    #On indique que la db est configuré
    touch /etc/postgresql/15/conf_done
fi

echo "---------------Starting postgresql service---------------"
postgres -D /etc/postgresql/15/main

