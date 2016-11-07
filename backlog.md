# As a user I want:

## UI | styling
- to have a general UI setup [joris]
    
## new project | upload
- to create a new project & [joris:front]
    - to upload a highresmovie and receive a lowresmovie(link)
    - progressbar (error)
    - error | notification: we converted your video to 2Mb a 30% reduction
- to add a new subtitle
    - styling
    - instant sort subtitle list on endtime

## templates
- to have a set of available templates on subtitle-select
- to have a set of inputs when I select a template
- to have a preview button (play video & loop through templates, hide scrubber, deselect subtitle)

## srubber
- to set the start and endtime of the new subtitle (scrubber)
- to have a custom scrubber

## srubber | videogular
- to have the video looping when I edit end- and starttime (videogular loop)

## open project
- to open an existing project (filter:recent | limit)
    - with list of subtitles
    - with list of templates
    - with lowres video

## shortcuts
- to control the ui with shortcuts
    - inform the user about the shortcuts

## final movie
- to render the final-movie
    - modal with options
    - bumper & watermark
    - to download the final-movie
    - to be notified by mail if the final-movie is ready
    - to be able to send the final-movie url to someone else?

- to be able to download the original movie?

## Authentication
- to authenticate via email-pasword
    - logout

# As a developer:
- I want to be notified when something went wrong (toaster)

- I want the render the final movie with subtitles and ffmpeg on a separate worker
    - have a separate que(for final movies) 

