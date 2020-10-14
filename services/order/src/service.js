const express  = require("express");
const awsParamStore = require( 'aws-param-store' );
const app = express(); 
const service = "orders"
const port = 8080;

const orders = [
  { id: 1, customerId: 1, orderDate: "Widget1" },
  { id: 2, customerId: 1, orderDate: "Widget2" },
  { id: 3, customerId: 2, orderDate: "Widget3" },
];

let orderList = [];

app.get(`/${service}/`, function(req,res){
  console.log("Get customer with ID: " + req.query.customerID);

  awsParamStore.getParameter( '/mystore/simulate-db-failure', { region: 'ap-southeast-2' } )
    .then( (simulateDBFailure) => {

    console.log("simulateDBFailre: " + simulateDBFailure.Value);

    if ( simulateDBFailure.Value === 'True' ) {
      let err = { "Error:" : "Failed to get customer orders. Simulated DB failure." };
      console.log(err);
      res.status(503).send(JSON.stringify(err));

    } else {
      orderList = orders.filter( order => { 
        return (order.customerId === parseInt(req.query.customerID));
      });

      res.send(orderList);    
    }
   
  });
});

app.get(`/${service}/status`, function(req,res){
  res.send("{\"Status\": \"OK\"}");
});

app.listen(port, function (){
  console.log(`Service ${service} running on port: ${port}`);
});
