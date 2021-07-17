rm -f start.log

CLUSTER="MyStore"
SERVICES="order-service customer-service customerorder-service"

for service in ${SERVICES}
do
	echo "Updating desired-count for ${service} to 2"
	aws ecs update-service --cluster ${CLUSTER} --service ${service} --desired-count 2 >> ./start.log
done
