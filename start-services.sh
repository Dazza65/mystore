rm -f start.log

SERVICES="order-service customer-service customerorder-service"

for service in ${SERVICES}
do
	echo "Updating desired-count for ${service} to 1"
	aws ecs update-service --cluster MyStore --service ${service} --desired-count 1 >> ./start.log
done
