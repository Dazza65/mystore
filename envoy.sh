while getopts p: flag
do
	case ${flag} in
		p) profile=${OPTARG};;
	esac
done

profile=${profile:-default}

region=`aws configure get --profile ${profile} region`

# Define variables #
ENVOY_REGISTRY="840364872350.dkr.ecr.${region}.amazonaws.com";

for TASK_DEF_ARN in arn:aws:ecs:ap-southeast-2:638876378760:task-definition/mystore-services-order-service:31 arn:aws:ecs:ap-southeast-2:638876378760:task-definition/mystore-services-customer-service:31 arn:aws:ecs:ap-southeast-2:638876378760:task-definition/mystore-services-customerorder-service:31
do
    TASK_DEF_VNODE=$(echo ${TASK_DEF_ARN} | cut -f6 -d: | cut -f4,5 -d-)
    TASK_DEF_OLD=$(aws ecs describe-task-definition --task-definition $TASK_DEF_ARN --profile ${profile});
    TASK_DEF_NEW=$(echo $TASK_DEF_OLD \
    | jq ' .taskDefinition' \
    | jq --arg ENVOY_REGISTRY $ENVOY_REGISTRY --arg TASK_DEF_VNODE $TASK_DEF_VNODE --arg AWS_REGION $region ' .containerDefinitions += 
            [
            {
                "image": ($ENVOY_REGISTRY + "/aws-appmesh-envoy:v1.12.5.0-prod"),
                "environment": [
                {
                    "name": "APPMESH_VIRTUAL_NODE_NAME",
                    "value": ("mesh/mystore-mesh/virtualNode/" + $TASK_DEF_VNODE + "-vnode")
                },
                {
                    "name": "ENABLE_ENVOY_XRAY_TRACING",
                    "value": "1"
                },
                {
                    "name": "ENABLE_ENVOY_STATS_TAGS",
                    "value": "1"
                },
                {
                    "name": "ENABLE_ENVOY_DOG_STATSD",
                    "value": "1"
                }
                ],
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                        "awslogs-region": $AWS_REGION,
                        "awslogs-group": "/ecs/mystore-services",
                        "awslogs-stream-prefix": "envoy"
                    }
                },
                "healthCheck": {
                "retries": 3,
                "command": [
                    "CMD-SHELL",
                    "curl -s http://localhost:9901/server_info | grep state | grep -q LIVE"
                ],
                "timeout": 2,
                "interval": 5,
                "startPeriod": 10
                },
                "essential": true,
                "user": "1337",
                "name": "envoy"
            },
            {
                "image": "amazon/aws-xray-daemon",
                "essential": true,
                "name": "xray",
                "portMappings": [
                {
                    "hostPort": 2000,
                    "protocol": "udp",
                    "containerPort": 2000
                }
                ],
                "healthCheck": {
                "retries": 3,
                "command": [
                    "CMD-SHELL",
                    "timeout 1 /bin/bash -c \"</dev/udp/localhost/2000\""
                ],
                "timeout": 2,
                "interval": 5,
                "startPeriod": 10
                },
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                        "awslogs-region": $AWS_REGION,
                        "awslogs-group": "/ecs/mystore-services",
                        "awslogs-stream-prefix": "xray"
                    }
                }
            },
            {
                "name": "cloudwatch-agent",
                "image": "amazon/cloudwatch-agent:latest",
                "secrets": [
                    {
                        "name": "CW_CONFIG_CONTENT",
                        "valueFrom": "/mystore/cw-agent-log-format"
                    }
                ],
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                    "awslogs-create-group": "True",
                    "awslogs-group": "/ecs/ecs-cwagent-fargate",
                    "awslogs-region": "ap-southeast-2",
                    "awslogs-stream-prefix": "ecs"
                    }
                }
            }
            ]' \
    | jq ' .containerDefinitions[0] +=
            { 
            "dependsOn": [ 
                { 
                "containerName": "envoy",
                "condition": "HEALTHY" 
                }
            ] 
            }' \
    | jq ' . += 
            { 
            "proxyConfiguration": {
                "type": "APPMESH",
                "containerName": "envoy",
                "properties": [
                { "name": "IgnoredUID", "value": "1337"},
                { "name": "ProxyIngressPort", "value": "15000"},
                { "name": "ProxyEgressPort", "value": "15001"},
                { "name": "AppPorts", "value": "8080"},
                { "name": "EgressIgnoredIPs", "value": "169.254.170.2,169.254.169.254"}
                ]
            }
            }' \
    | jq ' del(.status, .compatibilities, .taskDefinitionArn, .requiresAttributes, .revision) '
    ); \

    TASK_DEF_FAMILY=$(echo $TASK_DEF_ARN | cut -d"/" -f2 | cut -d":" -f1);
    echo $TASK_DEF_NEW > /tmp/$TASK_DEF_FAMILY.json && 

    # Register ecs task definition #
    aws ecs register-task-definition \
    --cli-input-json file:///tmp/$TASK_DEF_FAMILY.json --profile ${profile}

done
