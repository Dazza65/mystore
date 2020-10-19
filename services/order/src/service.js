const express  = require("express");
const awsParamStore = require( 'aws-param-store' );
const app = express(); 
const service = "orders"
const port = 8080;

const orders = [
  { id: 1, customerId: 1, orderDate: "01/03/2020", 
    items: [
      {id: 1, product: "widget", quantity: 1, price: 10.50},
      {id: 2, product: "solder", quantity: 1, price: 8.75},
      {id: 3, product: "case", quantity: 1, price: 23.00},
    ] 
  },
  { id: 2, customerId: 1, orderDate: "10/05/2020", 
    items: [
      {id: 1, product: "bottle", quantity: 1, price: 12.65},
      {id: 2, product: "brake cable", quantity: 2, price: 16.33}
    ]  
  },
  { id: 3, customerId: 2, orderDate: "02/03/2020", 
    items: [
      {id: 1, product: "glasses", quantity: 1, price: 110.80},
      {id: 2, product: "gloves", quantity: 1, price: 38.00}
    ] 
 },
];

function getOrders(customerID) {
  let orderList = orders.filter( order => { 
    return (order.customerId === customerID);
  });

  return(orderList);  
}

app.get(`/${service}/`, function(req,res){
  console.log("Get customer with ID: " + req.query.customerID);

  awsParamStore.getParameter( '/mystore/simulate-db-failure', { region: 'ap-southeast-2' } )
    .then( (simulateDBFailure) => {

      let failRate = Math.floor(100 / parseInt(simulateDBFailure.Value));

      console.log(`Fail rate: ${simulateDBFailure.Value}%`);

      if ( (Math.floor(Math.random() * failRate) + 1) == 1 ) {
        res.status(503).send(JSON.stringify({ "Error:" : "Failed to get customer orders. Simulated DB failure." }));
    } else {
      res.send(getOrders(parseInt(req.query.customerID)));   
    }  
  }).catch( (error) => {
    res.send(getOrders(parseInt(req.query.customerID)));
  })
});

app.get(`/${service}/status`, function(req,res){
  res.send("{\"Status\": \"OK\"}");
});

app.listen(port, function (){
  console.log(`Service ${service} running on port: ${port}`);
});
