# MongoDB Dockerization

1. [MongoDB setup with db authentication](https://github.com/kartikeybhardwaj/mongodb-dockerization#1-mongodb-setup-with-db-authentication)
2. [MongoDB setup with db authentication using replica sets](https://github.com/kartikeybhardwaj/mongodb-dockerization#2-mongodb-setup-with-db-authentication-using-replica-sets)

## 1. MongoDB setup with db authentication

#### Plan of action

1. Pull MongoDB image
2. Create a Javascript file to add a user in database
3. Write docker-compose file
4. Login to MongoDB with created credentials

#### Pull MongoDB image

    docker pull mongo:latest

Show pulled image by executing

    docker images

#### Create a Javascript file to add a user in database

Create a file named **init-mongo.js** or whatever as long as it’s a Javascript file

    db.auth("admin-user", "admin-password");

    db = db.getSiblingDB("appdb");

    db.createUser({
        user: "app-user",
        pwd: "app-password",
        roles: [{
            role: "dbOwner",
            db: "appdb",
        }],
    });

#### Write docker-compose file

Create a file named **docker-compose.yml** for setup your docker-compose stack. Here is our current directory structure

> MongoDB Dockerization
>> docker-compose.yml  
>> init-mongo.js

##### Explanation of docker-compose file
- `version` is a version of docker-compose file format, you can change to the latest version.
- `mongo_test` on line 5 is just a service name, you can change the name whatever you want.
- image must be **mongo**, because you want to create a container from mongo image.
- `container_name` is a name for your container, it’s optional.
- `environment` is a variables that will be used on the mongo container.
- `MONGO_INITDB_DATABASE` is database name at the point of initialization of database, should be **admin**.
- `MONGO_INITDB_ROOT_USERNAME` fill with username of root that you want for admin.
- `MONGO_INITDB_ROOT_PASSWORD` fill with password of root that you want for admin.
- `volumes` to define a file/folder that you want to use for the container.
- `./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo-js:ro` means you want to copy **init-mongo.js** to **/docker-entrypoint-initdb.d/** as a **read only** file. **/docker-entrypoint-initdb.d** is a folder that already created inside the mongo container used for initiating database, so we copy our script to that folder.
- `./mongo-volume:/data/db` means you want to set data on container persist on your local folder named **mongo-volume**. **/data/db/** is a folder that already created inside the mongo container.
- `ports` is to define which ports you want to expose and define, in this case we're using default mongoDB port **27017**.

##### Explanation of init-mongo.js file
- `db.auth` will allow you to authenticate as a user, authenticate with admin user and its password you put in docker-compose file.
- `db.getSiblingDB` is used to return another database without modifying the db variable in the shell environment. Here, we create **appdb** database for a user whom we want to give access to.
- `db.createUser` creates a user. Here, we add a user and password for the newly accessed sibling db **appdb** with role of **dbOwner**.

##### Execution

Now run the docker-compose file with `docker-compose up` or `docker-compose up -d` to run containers in the background.

Open another terminal to login to the container. Type `docker ps` to see our running container.

#### Login to MongoDB with created credentials

Login to your container by using container name

    docker exec -it <container-name> bash

Login to MongoDB with created User & Database by using

    mongo "mongodb://admin-user:admin-password@mongo_test:27017"

or

    mongo "mongodb://app-user:app-password@mongo_test:27017/appdb"

Here,
- `admin-user` and `admin-password` is our admin root credentials
- `mongo_test` is our container name, this should be a hostname of your mongo server
- `app-user` and `app-password` should be authenticated behind `appdb` to as thats what we wanted

## 2. MongoDB setup with db authentication using replica sets

#### Plan of action

1. Pull MongoDB image
2. Create a keyfile to connect only authenticated replica sets
3. Create a Javascript file to add a user in database
4. Write docker-compose file
5. Login to MongoDB as admin
6. Connect replica sets
7. Login to MongoDB with created credentials

#### Pull MongoDB image

    docker pull mongo:latest

Show pulled image by executing

    docker images

#### Create a keyfile to connect only authenticated replica sets

With keyfile authentication, each mongod instances in the replica set uses the contents of the keyfile as the shared password for authenticating other members in the deployment. Only mongod instances with the correct keyfile can join the replica set.

On UNIX systems, the keyfile must not have group or world permissions. On Windows systems, keyfile permissions are not checked.

You can generate a keyfile using any method you choose. For example, the following operation uses openssl to generate a complex pseudo-random 1024 character string to use as a shared password. It then uses chmod to change file permissions to provide read permissions for the file owner only:

    openssl rand -base64 756 > keyfile
    chmod 400 keyfile

Change owner of keyfile to 999 (for linux machines):
keyfile will need to be owned by the mongodb user in the container (uid=999(mongodb) gid=999(mongodb)).

    sudo chown 999:999 keyfile

#### Create a Javascript file to add a user in database

Create a file named **init-mongo.js** or whatever as long as it’s a Javascript file

    db.auth("admin-user", "admin-password");

    db = db.getSiblingDB("appdb");

    db.createUser({
        user: "app-user",
        pwd: "app-password",
        roles: [{
            role: "dbOwner",
            db: "appdb",
        }],
    });

#### Write docker-compose file

Create a file named **docker-compose-db.yml** for setup your docker-compose stack. Here is our current directory structure

> MongoDB Dockerization
>> docker-compose-db.yml  
>> keyfile  
>> init-mongo.js

##### Explanation of docker-compose file
- `version` is a version of docker-compose file format, you can change to the latest version.
- `mongo_test_1`, `mongo_test_2` and `mongo_test_3` are service names, you can change the name whatever you want.
- image must be **mongo**, because you want to create a container from mongo image.
- `container_name` is a name for your container.
- `environment` is a variables that will be used on the mongo container.
- `MONGO_INITDB_DATABASE` is database name at the point of initialization of database, should be **admin**.
- `MONGO_INITDB_ROOT_USERNAME` fill with username of root that you want for admin.
- `MONGO_INITDB_ROOT_PASSWORD` fill with password of root that you want for admin.
- `command` is important to understand as it differs from `entrypoint`. `entrypoint` takes command which executes as entry command when container starts. `command` takes arguments and append to the **entrypoint**.
- `--replSet rs0 --keyFile /opt/keyfile --bind_ip_all` is our **command**. **--replSet rs0** sets replica set name as **rs0**. **--keyFile /opt/keyfile** sets path to keyfile.
NOTE: You can also create a `mongod.conf` and mount it as volume to container's `/etc/mongod.conf` if you do not wish to user `command`.
- `volumes` to define a file/folder that you want to use for the container.
- `./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo-js:ro` means you want to copy **init-mongo.js** to **/docker-entrypoint-initdb.d/** as a **read only** file. **/docker-entrypoint-initdb.d** is a folder that already created inside the mongo container used for initiating database, so we copy our script to that folder.
- `./mongo-volume-1:/data/db` means you want to set data on container persist on your local folder named **mongo-volume-1**. **/data/db/** is a folder that already created inside the mongo container.
- `./keyfile:/opt/keyfile:ro` means you want to copy **keyfile** to **/opt/** as a **read only** file.
- `ports` is to define which ports you want to expose and define, in this case we're using default mongoDB port **27017** and exposing it to host machine as **27011** for service 1, **27012** for service 2 and **27013** for service 3.
- `ntw-db-test` is used as a bridge to connect all the three services in a network.

##### Explanation of init-mongo.js file
- `db.auth` will allow you to authenticate as a user, authenticate with admin user and its password you put in docker-compose file.
- `db.getSiblingDB` is used to return another database without modifying the db variable in the shell environment. Here, we create **appdb** database for a user whom we want to give access to.
- `db.createUser` creates a user. Here, we add a user and password for the newly accessed sibling db **appdb** with role of **dbOwner**.

##### Execution

Now run the docker-compose file with `docker-compose -f docker-compose-db.yml up` or `docker-compose -f docker-compose-db.yml up -d` to run containers in the background.

Open another terminal to login to the container. Type `docker ps` to see our running containers.

#### Login to MongoDB as admin

Login to your container by using container name

    docker exec -it mongo_test_1 bash

Login to MongoDB with admin user by using

    mongo "mongodb://admin-user:admin-password@mongo_test_1:27017"

#### Connect replica sets

    rs.initiate();

Initiates a replica set. Optionally, the method can take an argument (`rs.initiate(configuration)`) in the form of a document that holds the configuration of a replica set.

    rs.add("mongo_test_2");

We're logged into `mongo_test_1` container so we do not need to add itself in replica, it'll be done automatically and considered as PRIMARY of the replica set. `rs.add` adds a member to a replica set. To run the method, you must connect to the primary of the replica set.

    rs.addArb("mongo_test_3");

Adds a new arbiter to an existing replica set.

    rs.status();

Returns the replica set status from the point of view of the member where the method is run. This method provides a wrapper around the replSetGetStatus command. This output reflects the current status of the replica set, using data derived from the heartbeat packets sent by the other members of the replica set.

#### Login to MongoDB with created credentials

Login to your container by using container name

    docker exec -it <container-name> bash

Login to MongoDB with created User & Database by using

    mongo "mongodb://admin-user:admin-password@mongo_test_1:27017,mongo_test_2:27017,mongo_test_3:27017"

or

    mongo "mongodb://app-user:app-password@mongo_test_1:27017,mongo_test_2:27017,mongo_test_3:27017/appdb"

Here,
- `admin-user` and `admin-password` is our admin root credentials
- `mongo_test_1`, `mongo_test_2` and `mongo_test_3` are our container names, this should be a hostname of your mongo server
- `app-user` and `app-password` should be authenticated behind `appdb` to as thats what we wanted

#### References
- [Enable Access Control - MongoDB Manual](https://docs.mongodb.com/manual/tutorial/enable-authentication/)
- [Built-In Roles - MongoDB Manual](https://docs.mongodb.com/manual/reference/built-in-roles/#database-user-roles/)
- [Update Replica Set to Keyfile Authentication - MongoDB Manual](https://docs.mongodb.com/manual/tutorial/enforce-keyfile-access-control-in-existing-replica-set/)
- [Compose file version 3 reference | Docker Documentation](https://docs.docker.com/compose/compose-file/)
