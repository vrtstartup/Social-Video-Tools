#Deployment

Social Video Tools is currently packaged and distributed as a Docker image.

Installing docker on Mac: https://docs.docker.com/docker-for-mac/

The following steps describe how to deploy the Docker image using the CLI. Docker can be managed using a management UI too: http://portainer.io/

## docker basics
This guide assumes basic knowledge of Docker. It's reccommended to glance over the [Getting Started](https://docs.docker.com/engine/getstarted) tutorial in the Docker documentation


## running an image

All tags of the SVT application are stored on the public [Docker Hub](https://hub.docker.com/r/vrtstartup/social-video-tools/tags)

Running an image is quite simple:

`docker run --env-file=production.env -d -p 80:80 vrtstartup/social-video-tools:server-v1.0.0`

`docker run --env-file=production.env -d vrtstartup/social-video-tools:worker-v1.0.0`


Where:

* `--env-file=production.env` specifies which environment file is provisioned to the container. This keeps your app's secrets, secret.
* the `-d` flag runs the image in background (or deamon) mode, until you shut it down
* the `-p` flag maps ports from the host's machine to the image
* `docker ps -a` lists all running containers and their bound ports on the host system.


##clearing docker images

>Problem: You use Docker, but working with it created lots of images and containers. You want to remove all of them to save disk space and reduce clutter.

```
Delete all containers
docker rm $(docker ps -a -q)

Delete all images
docker rmi $(docker images -q)
```


##building a docker image

`docker build -t vrtstartup/social-video-tools:server-v1.0.0 .`

`docker build -t vrtstartup/social-video-tools:worker-v1.0.0 .`

Note that the last lines of the `Dockerfile` in the root of the application folder indicate wether the server or the worker component should be run.


