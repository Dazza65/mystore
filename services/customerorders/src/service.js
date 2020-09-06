const express  = require("express");
const fetch = require('node-fetch');

const app = express(); 
const this_service = "customerorders"
const customerservice = process.env.CUSTOMER_SVC || "localhost"
const customerserviceport = process.env.CUSTOMER_SVC_PORT || 9010
const orderservice = process.env.ORDER_SVC || "localhost"
const orderserviceport = process.env.ORDER_SVC_PORT || 9020

const port = 8080;

app.get(`/${this_service}/`, function(req,res){
  const customerID = req.query.customerID;
  let customerName = '';

  if ( customerID ) {}
  console.log("Get orders for customer: " + customerID);
  
  fetch(`http://${customerservice}:${customerserviceport}/customers/?id=${customerID}`)
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log("Returned data from customer service is: " + JSON.stringify(data));
    let orderList = [];
    if ( data.length > 0 ) {
      customerName = data[0].name;
      console.log(`Customer name is: ${customerName}`);

      fetch(`http://${orderservice}:${orderserviceport}/orders/?customerID=${customerID}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log("Returned data from orderservice: " + JSON.stringify(data));

        console.log(`CUSTNAME: ${customerName}`);

        data.forEach(order => {
          let customerOrder = order;
          customerOrder.customerName = customerName;
          orderList.push(customerOrder);
        });
        res.send(orderList); 
      })
    } else {
      res.send(orderList);
    }

  })
  .catch((error) => {
    let err = { "Error:" : "Failed to get customer orders." };
    console.log(error.message);
    res.status(503).send(JSON.stringify(err));
  })
});

app.get(`/${this_service}/status`, function(req,res){
  console.log("Status check...");
  res.send("{OK}"); 
});

app.listen(port, function (){
  console.log(`Service ${this_service} running on internal port: ${port}`);
  console.log(`Connecting to ${customerservice}. External port: ${customerserviceport}`);
  console.log(`Connecting to ${orderservice}.  External port: ${orderserviceport}`);
});
