# Prometheus_Grafana_Monitoring_a_NodeJS_app

For this demo I will set up monitoring with Prometheus and Grafana of the Node.js app previously used in this project:

https://github.com/otammato/FullStack_NodeJS_MySql_Docker.git

<img width="700" alt="Screenshot 2023-06-14 at 22 37 33" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/1ad3ea29-ea41-4624-a0f5-89dd16fda007">

This time I will set up the scraping of the default metrics and will be using the standard Grafana dashboards. However, in upcoming projects I plan to set up scraping of "RED" or "USE" metrics following this approach:

https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/

<br>
<br>

## Modifying the app files to allow Prometheus collecting metrics

1. Installing the ```prom-client```
   
  ```prom-client``` is the most popular Prometheus client libary for Node.js. It provides the building blocks to export metrics to Prometheus via the pull and push methods and supports all Prometheus metric types such as histogram, summaries, gauges and counters.

  https://www.npmjs.com/package/prom-client

The ```prom-client``` npm module can be installed via:

```
npm install prom-client
```
However, it is installed by default with the command ```npm install``` along with the other packages and doesn't need an explicit command. So, we leave our Docker file unchanged:

```
FROM node:11-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]
```

2. Add a dependency in the ```package.json``` file
   
<img width="700" alt="Screenshot 2023-06-14 at 20 58 10" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/58a6e697-2fa4-4493-b4d5-7ac77757269b">

3. Modify the index.js file:
   - Import the dependency
   - Set up Prometheus to collect default metrics
   - Add an endpoint to expose metrics

<img width="1000" alt="Screenshot 2023-06-14 at 21 04 35" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/438a0b64-f451-4dbd-ac7a-dc4b22478064">

<br>
<br>

## Create the network. Later we will place containers in the same network to enable them to communicate to each other

```docker network create my-network```

<br>
<br>

## Launch the container with the Node.js application

```cd FullStack_NodeJS_MySql_Prometheus/web_app_files/containers/node_app/codebase_partner```

```docker build -t myapp .```

```docker run -d --name myapp --network my-network -p 3000:3000 myapp```

<img width="1000" alt="Screenshot 2023-06-15 at 21 22 51" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/01a9db71-cbd4-4413-9c86-04980ede2ca2">

The mwtrics now are exposed:

<img width="1000" alt="Screenshot 2023-06-15 at 21 25 26" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/d6579c99-6ac9-4e79-b3cf-3b08b85d63b6">

<br>
<br>

## Launch the Prometheus container

```cd FullStack_NodeJS_MySql_Prometheus/web_app_files/containers/node_app/prometheus```

```yml
global:
  scrape_interval: 5s
scrape_configs:
  - job_name: "example-nodejs-app"
    static_configs:
      - targets: ["myapp:3000"] # we previously assigned the name 'myapp' to the Node.js container to make accessible by name
```

```docker run --rm -p 9090:9090   -v `pwd`/prometheus.yml:/etc/prometheus/prometheus.yml   prom/prometheus:v2.20.1```

<img width="1000" alt="Screenshot 2023-06-15 at 21 26 59" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/4ab138d1-53b7-4495-9c30-abda592589a1">

<img width="1000" alt="Screenshot 2023-06-15 at 21 29 41" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/517212c9-a8a5-4207-b5f1-75a976663292">

<img width="1000" alt="Screenshot 2023-06-15 at 21 30 55" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/5c7c84a5-b820-40a3-b3ce-905d520eb6d4">

<br>
<br>

## Launch the Grafana container

```cd FullStack_NodeJS_MySql_Prometheus/web_app_files/containers/node_app/grafana```

```yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    orgId: 1
    url: prometheus:9090 # we previously assigned the name 'prometheus' to the Prometheus container to make accessible by name
    basicAuth: false
    isDefault: true
    editable: true
```

```
docker run --rm --network my-network -p 3001:3000   -e GF_AUTH_DISABLE_LOGIN_FORM=true   -e GF_AUTH_ANONYMOUS_ENABLED=true   -e GF_AUTH_ANONYMOUS_ORG_ROLE=Admin   -v `pwd`/datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml   grafana/grafana:7.1.5
```


<img width="1000" alt="Screenshot 2023-06-15 at 20 40 00" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/d527cd82-7f08-44e8-bc95-0e1e0d7000b9">

<br>
<br>

## Launch Grafana dashboards

1. 11159
<img width="1000" alt="Screenshot 2023-06-15 at 20 50 51" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/fc049196-baec-49ef-be36-2c082d3994cf">
<img width="1000" alt="Screenshot 2023-06-15 at 20 52 33" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/ea5531be-9e5e-48e7-81f8-c872099a712f">

<br>
<br>

2. 14058

<img width="1327" alt="Screenshot 2023-06-15 at 20 58 34" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/85dfa1c6-4f1c-48fd-85ed-ab98ad04716c">

<img width="1000" alt="Screenshot 2023-06-15 at 20 57 21" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/72746895-d99a-4d34-9e19-b9eda7d87eef">

<br>
<br>

3. 11956

<img width="1327" alt="Screenshot 2023-06-15 at 21 03 19" src="https://github.com/otammato/Prometheus_Grafana_Monitoring_a_NodeJS_app/assets/104728608/47021402-b8be-4960-994e-57bc97701595">
