rm -f stop.log

CLUSTER="MyStore"
SERVICES="order-service customer-service customerorder-service"

for service in ${SERVICES}
do
	echo "Updating desired-count for ${service} to 0"
	aws ecs update-service --cluster ${CLUSTER} --service ${service} --desired-count 0 >> ./stop.log
done
