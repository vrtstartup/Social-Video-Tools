FROM node

RUN mkdir -p /data/bin
RUN curl https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz >> /data/bin/ffmpeg-git-64bit-static.tar.xz
RUN tar -xJf /data/bin/ffmpeg-git-64bit-static.tar.xz -C /data/bin
ENV PATH /data/bin/ffmpeg-3.2.2-64bit-static/:$PATH
RUN ffmpeg -h

