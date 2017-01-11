# Social Video Tools

## Social Video What?
>Social Video Tools is a distributed web application that enables users in annotating videos targeted for distribution on social media. These annotations can be either styled subtitles in ASS format, or complex designed After Effects templates.

An example video created using the application can be found [here](https://social-video-tools.s3.amazonaws.com/projects/-K_KARkiKn3jT8vuzfak/render.mp4)

## Components
The application consists of several core components, which can be briefly described as follows:

* _client application_: Angular 2 based web application that lives in the user's browser.
* _server application_: node server application that serves the client and provides several useful API endpoints.
* _worker_: simple node app that handles incoming queue messages and regulates video processing. This component does the heavy lifting required to render video files. 

In order to generate versioned After Effects templates, a fourth component is added to the application. This component consists of:
* An instance of Adobe After Effects
* [Dataclay Templater Bot](http://dataclay.com/) plugin for After Effects
* an uploader script that stores generated assets in the cloud (S3)

## Getting started

To get your local development environment up and running, clone this repo and install with:

`npm install && npm install --only=dev`

### Dependencies 

You should have ffmpeg installed with --libass.

### Environment variables
The application expects the following environment variables to be set:
* `NODE_ENV` either '_development_' or '_production_'
* `PORT` the port on which the server should listen
* `DATA_FOLDER` a temp folder to store files while they're being uploaded to cloud storage (S3)

Social Video Tools uses FireBase to store data and provide user authentication. After you've set up a FireBase application set the following environment variables accordingly:

* `FIREBASE_TYPE`
* `FIREBASE_PROJECT_ID`
* `FIREBASE_PRIVATE_KEY_ID`
* `FIREBASE_PRIVATE_KEY`
* `FIREBASE_CLIENT_EMAIL`
* `FIREBASE_CLIENT_ID`
* `FIREBASE_AUTH_URI`
* `FIREBASE_TOKEN_URI`
* `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`
* `FIREBASE_CLIENT_X509_CERT_URL`
* `FIREBASE_DATABASEURL`

Postmark is used to deliver notification emails to users whenever a processing job finnishes:
    
* `POSTMARK_SECRET`

We've chosen to use S3 buckets as blob storage provided by Amazon Web Services. You should configure a bucket in a region of your choice and configure an IAM Role with proper access rights. This S3 bucket will be used to store files (video, subtitles and thumbs) related to user projects:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_BUCKET_NAME`
* `AWS_BUCKET_REGION`

### configuration

most of the application's non-sensitive configuration lives in the `common/config` folder. Some highlights:

* `feedback.ts` contains the webhook URL used to send notifications to a Slack channel
* `firebase.ts` contains configuration for your FireBase application
* `routing.ts` routing information for your server
* `uploader.ts` contians the folder path where assets rendered by After Effects are stored
* `winston.ts` logging configuration

### running the application

`npm run server` runs the webserver

`npm run worker` runs the worker app responsible for video processing

and you're good to go.

We've provided a webpack development server for doing development work on the client web app on your local machine:

`npm run dev-server`

### License
GNU GPLv3
