echo "Creating base network stack"
aws cloudformation create-stack --stack-name mystore-base --parameters ParameterKey=MyHostedDomain,ParameterValue=darrenharris.me --capabilities CAPABILITY_NAMED_IAM --template-body file://mystore-base.yml
aws cloudformation wait stack-create-complete --stack-name mystore-base
if [ $? -ne 0 ]
then
    echo "Error creating base stack"
    exit 1
fi

echo "Creating ElasticSearch domain"
aws cloudformation create-stack --stack-name mystore-es --parameters ParameterKey=MyBase,ParameterValue=mystore-base --template-body file://mystore-es.yml
aws cloudformation wait stack-create-complete --stack-name mystore-es
if [ $? -ne 0 ]
then
    echo "Error creating ElasticSearch domain"
    exit 1
fi

echo "Creating ECS(Fargate) Services"
aws cloudformation create-stack --stack-name mystore-services --parameters ParameterKey=MyBase,ParameterValue=mystore-base --capabilities CAPABILITY_NAMED_IAM --template-body file://mystore-services.yml
aws cloudformation wait stack-create-complete --stack-name mystore-services
if [ $? -ne 0 ]
then
    echo "Error creating ECS(Fargate) Services"
    exit 1
fi