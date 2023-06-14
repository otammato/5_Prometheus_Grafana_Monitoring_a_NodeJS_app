  
# Docker. A full stack demo for the containerized web app. Node.js/Express - frontend, MySql - backend.

<br>
For this demo, I'll be deploying a web app from another project (built using Node.js and Express) located at https://github.com/otammato/WebApp_NodeJS_AWS_RDS_MySql.git. The previous deployment was done on EC2 and RDS instances.
<br><br>

This time, we will launch two Docker containers on an EC2 instance. One container will host the application, while the other will host the MySQL database. 

After successful deployment, the Docker images will be pushed and stored permanently within the AWS Elastic Container Registry (ECR) for centralized management and preservation.
<br><br>
This simple web application interacts with a MySQL database, enabling the performing of CRUD (Create, Read, Update, Delete) operations on the data stored within the database.
<br><br>
Steps:
- Launch MySQL containerized server
- Launch Node.js app containerized server
- Test the app
- Push the images to Docker hub

<br><br>
<p align="center" >
  <img width="700" alt="Screenshot 2023-01-31 at 19 23 50" src="https://user-images.githubusercontent.com/104728608/216415601-4f8b42e4-d7f6-4e0a-9274-16a062b7591d.png">
</p>

<br><br>

<p align="center" >
  <img width="700" alt="Screenshot 2023-02-01 at 20 11 38" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/ccab549a-0045-489b-9ff8-02de5ef921fa">
</p>
<br><br>


<p align="center" >
  <img width="700" alt="Screenshot 2023-01-31 at 19 23 50" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/cf51b385-90d9-4a47-be53-0ca66e1b797d">
</p>

<br><br>

## The app's architecture diagram:

<p align="center" >
  <img width="700" alt="Screenshot 2023-01-31 at 19 23 50" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/1c930171-c2a2-4931-b2d0-ea3b0df018c2">
</p>

<br><br>

## The app's files:

> 1. [For creating the database (MySQL) container](https://github.com/otammato/FullStack_NodeJS_MySql_Docker/tree/57e06b38dcba8179fc8b0ee8757b5d94c5a3a0de/web_app_files/containers/mysql)
> 2. [For creating the app (Node.JS) container](https://github.com/otammato/FullStack_NodeJS_MySql_Docker/tree/04dd0fa47f8d01361dc133664129347503f2d292/web_app_files/containers/node_app/codebase_partner)
> 3. [A database backup](https://github.com/otammato/FullStack_NodeJS_MySql_Docker/blob/ac9468edb44f095392065d7f610fb62e73c78ea0/web_app_files/resources/my_sql.sql)

To download all of them clone the current repository: ```git clone https://github.com/otammato/FullStack_NodeJS_MySql_Docker.git```

<br>
<br>


## Pre-requisites:
1. Launch an instance. I am using Ubuntu 22.04 AWS EC2 instance.
2. Open the port to access the app. I am using 3000.
3. Install Docker on the machine: ```sudo apt-get install docker.io``` for Ubuntu.
4. Install MySQL or MariaDB on the machine: ```sudo apt-get install mariadb-client-core-10.6``` for Ubuntu.

<br>
<br>


## 1. MySQL containerized server

1.1. Navigate to the ```web_app_files/containers/mysql/```

1.2. Create or download the Docker [file](https://github.com/otammato/FullStack_NodeJS_MySql_Docker/blob/3c13fb0ed84e4a9ac806bb6261581da2b1e9ce19/web_app_files/containers/mysql/Dockerfile). Name it just ```Dockefile``` with no extension:

```yml
FROM mysql:8.0.23
COPY my_sql.sql /docker-entrypoint-initdb.d/
EXPOSE 3306
```
> The Dockerfile description:
> 
> ```my_sql.sql``` is a database backup copy which I created by ```mysqldump``` command. It contains ```COFFEE``` database.
> 
> The COPY command copies the "my_sql.sql" file from the build context (the same directory as the Dockerfile) to the ```/docker-entrypoint-initdb.d/ ``` directory inside the container. The ```/docker-entrypoint-initdb.d/``` directory is a special directory in the MySQL Docker image, and any SQL scripts placed in this directory will be automatically executed when the container starts.
Make sure that the ```my_sql.sql``` file is located in the same directory as the Dockerfile. The SQL statements from the ```my_sql.sql``` file will be executed during the container initialization and creates a database named ```COFFEE```.

1.3. ```sudo docker build --tag my-sql-test . ``` Build a Docker image with the tag "my-sql-test". The period at the end of the command represents the build context, which is the current directory. THIS MEANS THAT THE DOCKERFILE FOR BUILDING THE IMAGE SHOULD BE PRESENT IN THE CURRENT DIRECTORY.

1.4. ```sudo docker run --name mysql_1 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=12345678 -d my-sql-test``` Run a Docker container based on the image tagged as "my-sql-test". The container is named "mysql_1", and it runs a MySQL database server inside it. The container's port 3306 is mapped to the host machine's port 3306, allowing access to the MySQL server from the host. The environment variable MYSQL_ROOT_PASSWORD is set to "12345678", which serves as the password for the MySQL root user within the container. The container runs in the background (detached mode) with the -d flag.

1.5. ```sudo docker inspect network bridge``` or ``` docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_id>``` Discover the running conainer's IP.

1.6. ```mysql -h 172.17.0.2 -P 3306 -u root -p``` Connect to a MySQL database server using the MySQL command-line client.

1.7. When testing connection to the database use the below commands to create a user named ```admin``` with the password ```12345678```, grant all privileges to that user on all databases and tables, and flush the privileges to ensure the changes take effect.
```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%';
FLUSH PRIVILEGES;
```
You will need this because Node.js configuration suggests "admin" user for connecting to the database.

<img width="300" alt="Screenshot 2023-06-04 at 12 18 34" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/0b209554-b4a3-4061-b17a-1cbf8d071296">

<br>
<br>


## 2. Node.js app containerized server

2.1. Navigate to the ```web_app_files/containers/node_app/codebase_partner```

2.2. Create or download the Docker [file](https://github.com/otammato/FullStack_NodeJS_MySql_Docker/blob/0a752e41bfab83f616d35690a52de4a537821928/web_app_files/containers/node_app/codebase_partner/Dockerfile). Name it just ```Dockefile``` with no extension:

```yaml
FROM node:11-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]
```

> This Dockerfile:
> 
> Sets up a Node.js environment based on ```node:11-alpine``` image, creates a directory ```/usr/src/app``` inside the container. The ```-p``` flag ensures that if the parent directories don't exist, they will be created. Then sets the working directory within the container to ```/usr/src/app```, copies the application code into the container, installs dependencies using npm, exposes port 3000 for inbound connections, and specifies the command to start the Node.js application. 

2.3. ```docker build --tag node_app .``` Build the docker image from the context in current directory. Dockerfile must be here.

2.4. ```docker ps``` To discover the MySQL's <container_id>

2.5. ```sudo docker inspect network bridge``` or ``` docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_id>``` Discover the running MySQL conainer's IP.

2.4. ```docker run -d --name node_app_1 -p 3000:3000 -e APP_DB_HOST=172.17.0.2 node_app``` Run a Docker container for a Node.js application.
```-e APP_DB_HOST=172.17.0.2``` This flag sets the environment variable APP_DB_HOST to "172.17.0.2" (discovered in the previous step). It specifies the host or IP address of the database server that the Node.js application should connect to. 

<br>
<br>

## 3. Test the app

3.1. ```sudo docker inspect network bridge``` or ``` docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_id>``` Discover the running conainers' IP.

3.2. ```curl 172.17.0.3:3000``` Use "curl" command to request the discovered in the previous step IP and the application port

<p align="center" >
  <img width="700" alt="Screenshot 2023-02-01 at 20 11 38" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/35abd2e4-0dbf-438c-bf16-67defb0f489e">
</p>
<br><br>

3.3. Connect from the global internet using the public DNS of public ip of your server in a web browser:

<p align="center" >
  <img width="700" alt="Screenshot 2023-02-01 at 20 11 38" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/ccab549a-0045-489b-9ff8-02de5ef921fa">
</p>
<br><br>

<br>
<br>

## 4. Push the images to Docker Hub

4.1. ```docker login``` Please use your DockerHub login and password.

<p align="center" >
  <img width="700" alt="Screenshot 2023-02-01 at 20 11 38" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/fe5f189e-b9fb-48db-a940-b005f84be7e0">
</p>
<br><br>


4.2. ```docker images```

<p align="center" >
  <img width="700" alt="Screenshot 2023-02-01 at 20 11 38" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/6d9f5992-c639-4173-b94c-cfed2e287782">
</p>
<br><br>

4.3. ```docker tag 15be6b7d99c6 montcarotte/fullstack_nodejs_mysql_demo:node_app```

4.4. ```docker tag 8bc7fabed8a9 montcarotte/fullstack_nodejs_mysql_demo:mysql_server```

4.5. ```docker push montcarotte/fullstack_nodejs_mysql_demo:mysql_server```

4.6. ```docker push montcarotte/fullstack_nodejs_mysql_demo:node_app```

<p align="center" >
  <img width="700" alt="Screenshot 2023-02-01 at 20 11 38" src="https://github.com/otammato/FullStack_NodeJS_MySql_Docker/assets/104728608/af0d01d7-7cf7-4ece-a54d-1e7451520de4">
</p>
<br><br>

