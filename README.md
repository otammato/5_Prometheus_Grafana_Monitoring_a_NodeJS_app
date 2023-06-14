# Prometheus_Grafana_Monitoring_a_NodeJS_app

For this demo I will set up monitoring with Prometheus and Grafana of the Node.js app previously used in this project:

https://github.com/otammato/FullStack_NodeJS_MySql_Docker.git

This time I will set up the scraping of the default metrics and use the standard Grafana dashboards. However, in upcoming projects I plan setting up scraping of "RED" or "USE" metrics following this approach:

https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/



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


## Launch the container with the Node.js application

```cd FullStack_NodeJS_MySql_Prometheus/web_app_files/containers/node_app/codebase_partner```

```docker build -t myapp .```
