const express  = require("express");
const app = express(); 
const winston = require('winston');
const service = "customers"
const port = 8080;

const logConfiguration = {
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.json()
};

const logger = winston.createLogger(logConfiguration);

const customers = [
  { id: 1, name: "Darren Harris" },
  { id: 2, name: "Joe Black" },
  { id: 3, name: "Sid Vicious" },
  { id: 4, name: "Penelope Pitstop" },
  { id: 5, name: "Robin Hood" },
];

app.get("/customers/", function(req,res){
  logger.info({
    message: "Get customer",
    params: [req.query.id]
  });

  let customerArray = [...customers]; 

  if( req.query.id ) {
	  customerArray = customerArray.filter( customer => { 
	    return (customer.id === parseInt(req.query.id));
	  });
  }

   res.send(customerArray); 
});

app.get(`/${service}/status`, function(req,res){
  res.send("{\"Status\": \"OK\"}");
});

app.listen(port, function (){
  logger.info({
    message: 'Service running',
    service: service,
    port: port
  });
});
