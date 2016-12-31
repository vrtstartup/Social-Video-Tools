## environment variables

Environment variables are stored in a seperate file in order to keep application secrets from falling into the wrong hands.

Docker containers can be run using an .env file as follows:

`docker run docker-image --env-file production.env`

Currently, the env file for Social Video Tools' production environment is stored at:

>https://www.protectedtext.com/socialvideotools
