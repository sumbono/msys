# msys
microservices for supporting backend part of a network monitoring system created using nodeJS

A prototype of supporting services for a network monitoring system. receiving sensor data from udp port and serve the data through API. 
In this repos, we created some microservices too, to handle some data processing and 
creating updated collections to keep the network monitoring systems webapps always get fresh data.

#To Start using pm2:
    - install pm2 on your machine: npm install pm2 -g
    - previously you should have installed nodejs on your machine. 
      If you haven't install nodejs on your machine, you can follow to this link: https://nodejs.org
    - after pm2 installed on your machine, just type this on command line: pm2 start ecosystem.config.js
    - your app will start..
