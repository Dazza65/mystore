const express  = require("express");
const app = express(); 
const service = "customers"
const port = 8080;

const customers = [
  { id: 1, name: "Darren Harris" },
  { id: 2, name: "James Bromberger" }
];

app.get("/customers/", function(req,res){
  console.log("Get customer: " + req.query.id);

  let customerArray = [...customers]; 

  if( req.query.id ) {
	  customerArray = customerArray.filter( customer => { 
	    return (customer.id === parseInt(req.query.id));
	  });
  }

   res.send(customerArray); 
});


app.listen(port, function (){
  console.log(`Service ${service} running on port: ${port}`);
});
