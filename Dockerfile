# node as base image
FROM node

# dependencies
RUN apt-get update 
RUN apt-get install -y zip curl

# ffmpeg
RUN mkdir -p /data/bin
RUN curl https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-64bit-static.tar.xz >> /data/bin/ffmpeg-git-64bit-static.tar.xz
RUN tar -xJf /data/bin/ffmpeg-git-64bit-static.tar.xz -C /data/bin

# env
ENV PATH /data/bin/ffmpeg-3.2.2-64bit-static/:$PATH

# source
RUN curl -o data/master.zip -L https://codeload.github.com/vrtstartup/Social-Video-Tools/zip/master
RUN cd data && unzip master.zip && mv Social-Video-Tools-master/* . && rm -rf Social-Video-Tools-master master.zip

# npm 
RUN cd data && npm install && npm install --only=dev && npm i -g typescript

# build 
RUN cd data && tsc && npm run build-prod && cp -R dist/ build/dist

EXPOSE 80

# start worker
CMD cd data && node /data/build/worker/worker.js

# start server
# CMD cd data && node /data/build/server/server.js