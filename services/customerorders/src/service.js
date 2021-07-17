const express  = require("express");
const fetch = require('node-fetch');
const winston = require('winston');

const app = express(); 
const this_service = "customerorders"
const customerservice = process.env.CUSTOMER_SVC || "localhost"
const customerserviceport = process.env.CUSTOMER_SVC_PORT || 8080
const orderservice = process.env.ORDER_SVC || "localhost"
const orderserviceport = process.env.ORDER_SVC_PORT || 8080

const port = 8080;

const logConfiguration = {
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.json()
};

const logger = winston.createLogger(logConfiguration);

app.get(`/${this_service}/`, function(req,res){
  const customerID = req.query.customerID;
  let customerName = '';

  if ( customerID ) {
    // TODO: Get orders for the specified ID or return all
  }

  logger.info({
    message: "Get orders for customer",
    params: [customerID]
  });
  
  fetch(`http://${customerservice}:${customerserviceport}/customers/?id=${customerID}`)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    else {
      throw new Error(res.statusText);
    }
  })
  .then(data => {
    logger.info({
      message: "Returned data from customer service",
      data: JSON.stringify(data)
    });

    let orderList = [];
    if ( data.length > 0 ) {
      customerName = data[0].name;
      logger.info({
        message: `Customer name is: ${customerName}`
      });

      fetch(`http://${orderservice}:${orderserviceport}/orders/?customerID=${customerID}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        else {
          throw new Error(res.statusText);
        }
      })
      .then(data => {
        logger.info({
          message: "Returned data from order service",
          data: JSON.stringify(data)
        });

        data.forEach(order => {
          let customerOrder = order;
          customerOrder.customerName = customerName;
          orderList.push(customerOrder);
        });
        res.send(orderList); 
      })
      .catch((error) => {
        let err = { "Error:" : "Failed to get customer orders." };
        logger.error({
          error: "Failed to get customer orders."
        });
        res.status(503).send(JSON.stringify(err));
      })
    } else {
      res.send(orderList);
    }
  })
  .catch((error) => {
    let err = { "Error:" : "Failed to get customer." };
    logger.error({
      error: error.message
    });
    res.status(503).send({
      status: 503,
      error: 'Failed to get customer details'
    });
  })
});

app.get(`/${this_service}/status`, function(req,res){
  res.send("{\"Status\": \"OK\"}"); 
});

app.listen(port, function (){
  logger.info({
    message: 'Customer Order Service running',
    params: [this_service, port]
  });
  logger.info({
    message: `Connecting to ${customerservice}`,
    params: [customerservice, customerserviceport]
  });
  logger.info({
    message: `Connecting to ${orderservice}`,
    params: [orderservice, orderserviceport]
  });
});
