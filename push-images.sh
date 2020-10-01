while getopts p:v: flag
do
	case ${flag} in
		p) profile=${OPTARG};;
		v) version=${OPTARG};;
	esac

done

profile=${profile:-default}
version=${version:-latest}
region=`aws configure get --profile ${profile} region`
account=`aws sts --profile ${profile} get-caller-identity | jq --raw-output .Account`

echo "Log in to ECR ${account}.dkr.ecr.${region}.amazonaws.com"
aws ecr get-login-password --region ${region} --profile ${profile} | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.amazonaws.com

for dockerImage in `docker images --filter=reference="*service:${version}" --format "{{.ID}}:{{.Repository}}"`
do
	imageId=`echo ${dockerImage} | cut -f1 -d:`
	repositoryImg=`echo ${dockerImage} | cut -f2 -d:`
	echo "Tag image ${imageId} - ${repositoryImg}"
	if [ ${version} != "latest" ]
	then
		docker tag ${imageId} ${account}.dkr.ecr.${region}.amazonaws.com/${repositoryImg}:${version}
	fi
	docker tag ${imageId} ${account}.dkr.ecr.${region}.amazonaws.com/${repositoryImg}:latest

	aws ecr describe-repositories --profile ${profile} --repository-name ${repositoryImg} > /dev/null 2>&1
	if [ $? -ne 0 ]
	then
		aws ecr create-repository --profile ${profile} --repository-name ${repositoryImg}
	fi

	echo "Push image ${account}.dkr.ecr.${region}.amazonaws.com/${repositoryImg}:${version} to remote repo"
	if [ ${version} != "latest" ]
	then
		docker push ${account}.dkr.ecr.${region}.amazonaws.com/${repositoryImg}:${version}
	fi
	docker push ${account}.dkr.ecr.${region}.amazonaws.com/${repositoryImg}:latest
done
