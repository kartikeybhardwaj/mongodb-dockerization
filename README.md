# MongoDB Dockerization

#### Plan of action

1. Pull MongoDB image
2. Create a file for initiate authenticated database and user
3. Write docker-compose file
4. Login to MongoDB with created credentials

#### Pull MongoDB image

    docker pull mongo:latest

Show pulled image by executing

    docker images

#### Create a file for initiate authenticated database and user

Create a file named **init-mongo.js** or whatever as long as it’s a Javascript file

    db.createUser({
        "user": "kart",
        "pwd": "oon",
        "roles": [{
            "role": "userAdminAnyDatabase",
            "db": "admin"
        }, "readWriteAnyDatabase"]
    });

#### Write docker-compose file

Create a file named **docker-compose.yml** for setup your docker-compose stack. Here is our current directory structure

> MongoDB Dockerization
>> docker-compose.yml  
>> init-mongo.js

##### Explanation
- `version` is a version of docker-compose file format, you can change to the latest version
- `mongo_test_service` on line 3 is just a service name, you can change the name whatever you want
- image must be **mongo**, because you want to create a container from mongo image
- `container_name` is a name for your container, it’s optional
- `environment` is a variables that will be used on the mongo container
- `MONGO_INITDB_DATABASE` you fill with a database name that you want to create, make it same like **init-mongo.js**
- `MONGO_INITDB_ROOT_USERNAME` you fill with username of root that you want
- `MONGO_INITDB_ROOT_PASSWORD` you fill with password of root that you want
- `volumes` to define a file/folder that you want to use for the container
- `./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo-js:ro` means you want to copy **init-mongo.js** to **/docker-entrypoint-initdb.d/** as a **read only** file. **/docker-entrypoint-initdb.d** is a folder that already created inside the mongo container used for initiating database, so we copy our script to that folder
- `./mongo-volume:/data/db` means you want to set data on container persist on your local folder named **mongo-volume**. **/data/db/** is a folder that already created inside the mongo container.
- `ports` is to define which ports you want to expose and define, in this case we're using default mongoDB port **27017** until **27019**

##### Execution

Now run the docker-compose file with `docker-compose up` or `docker-compose up -d` to run containers in the background

Open another terminal to login to the container. Type `docker container ls` to see our running container

#### Login to MongoDB with created credentials

Login to your container by using container name

    docker exec -it <container-name> bash

Login to MongoDB with created User & Database by using

    mongo -u <your username> -p <your password> --authenticationDatabase <your database name>

or

    mongo "mongodb://YourUsername:YourPasswordHere@127.0.0.1:27017/your-database-name"

#### Notes:

- If you look at the `mongod` logs closely, you'll find `failed to load: /docker-entrypoint-initdb.d/init-mongo.js`, this is because the user you're trying to add using `init-mongo.js` has already been added by `docker-entrypoint.sh`. `docker-entrypoint.sh` reads container's environment variables and sets `--auth` flag accordingly. Thus, you can comment out `- ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro` from volumes of container as specified in docker-compose file.

#### References
- [Enable Access Control - MongoDB Manual](https://docs.mongodb.com/manual/tutorial/enable-authentication/)
- [Compose file version 3 reference | Docker Documentation](https://docs.docker.com/compose/compose-file/)
