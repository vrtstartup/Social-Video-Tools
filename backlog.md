# As a user I want:

## UI | styling
- to have a general UI setup
    
## new project | upload
- to create a new project
    - to upload a highresmovie and receive a lowresmovie(link)
    - progressbar
- to add a new subtitle
    - styling
    - instant sort subtitle list on endtime
    - TODO: subtile-preview
    - TODO: indication when bumper - endtime

## templates
- to have a set of available templates on subtitle-select
- to have a set of inputs when I select a template
- TODO: to have a preview button (play video & loop through templates, hide scrubber, deselect subtitle)

## srubber
- to set the start and endtime of the new subtitle (scrubber)

## srubber | videogular
- to have the video looping when I edit end- and starttime (videogular loop)

## projectStatus
- TODO project-list: after renderMovie click
- TODO: select an existing project (filter:recent | limit)
- TODO: projcet-status

## shortcuts
- TODO: to control the ui with shortcuts
    - inform the user about the shortcuts

## final movie
- to render the final-movie
    - TODO: modal with optional: bumper
    - bumper & watermark
    - to download the final-movie
    - to be notified by mail if the final-movie is ready
    - to be able to send the final-movie url to someone else?
    - TODO: download-page (preview + button)

## Authentication
- to authenticate via email-pasword
    - logout
    - accoutn activation: confirmation mail
    - rollen (admin | user | test)

# As a developer:

## Logging:
- TODO: in admin -> show logfiles
- TODO: front: I want to be notified when something went wrong (toaster)

## templater testing

## deploy on Amazon
- I want the render the final movie with subtitles and ffmpeg on a separate worker 

