# Prometheus_Grafana_Monitoring_a_NodeJS_app

For this demo I will set up monitoring with Prometheus and Grafana of the Node.js app previously used in this project:

https://github.com/otammato/FullStack_NodeJS_MySql_Docker.git

This time I will set up scraping of the default metrics and use the standard Grafana dashboards. However, in upcoming projects I plan setting up scraping of "RED" or "USE" metrics following this approach:

https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/



## Modifying the app files to allow Prometheus collecting metrics
