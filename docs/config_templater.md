#Templater configuration

This is how you configure Dataclay templater bot to accept and process input from Social Video Tools: 
 * `source` should be set to http://35.156.200.8/api/templater/queue. Don't worry about the remote data source warning; The afterjob.bat script takes care of updating the system
 * `out` folder should be set to the same value configured in `common/config/uploader.ts`. This is the folder from where output files will be uploaded to the cloud. 
 * in the `preferences` menu the afterjob.bat script should be set as follows: `D:\...\uploader\afterjob.bat $output $projectId $overlayId`. the variables prefixed with `$` are handled by the bot.
 
 After clicking `render` the bot now listens for updates in Social Video Tools' endpoint and renders assets accordingly. After each render job the upload script will upload the generated asset to S3, and update the project status using the API. 
