# Pre-requerements

Io.js: [https://iojs.org/en/index.html](download)

ApacheBenchmark: [http://httpd.apache.org/docs/2.2/programs/ab.html](info)

# Update configuration if needed

If needed you can change IP address or accounts in javascript file:

/modules/testing/models/load.js

# Start load server

In the folder where you pulled git repository you should run:

> iojs --es_staging .

# You can do manuall calls to Mintchip using Expolorer:

[http://localhost:3002/explorer/#!/loads/](Explorer)

Where

/testConnection  endpoint is basically getInfo of broker account

/testOneWay  creates 1 cent VTM and load it to store

# To run tests you may use Apache Benchmark or any other tool like Jmeter

For AB (Apache Benchmark I was using following configuration)

> ab -t 10000000000 -s 600 -n 1000 -c 1 http://127.0.0.1:3002/api/loads/testOneWay

Please note that Node.JS should running when you execute tests.
