# mystore-orderservice
MyStore Order Service
## Docker
1. Build docker image  
`docker build -t orderservice .`
2. Run image locally  
`docker run -p 8080:8080 orderservice`
`curl -l http://localhost:8080/orders/?customerID=1`
## AWS
1. Login to Elastic Container Registry (ECR)  
`aws ecr get-login-password --region <region> --profile <profile> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com`
2. Tag docker image  
`docker tag <docker image id> <aws_account_id>.dkr.ecr.<region>.amazonaws.com/orderservice:1.0.0`
2. Push docker image to ECR  
`docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/orderservice`
