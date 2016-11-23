export default {
    subtitle: {
        name: 'subtitle', 
        text: 'Dit is de tekst van de ondertitel.',
        imageUrl: 'http://placehold.it/250x250',
        type: 'subtitle'
    },
    bumper: {
        name: 'bumper', 
        imageUrl: 'http://placehold.it/250x250',
        duration: 7,
        transitionDuration: 3,
        type: 'outro',
    },
    logo: {
        name:'logo1',
        imageUrl: 'http://placehold.it/250x250',
        scale: 1,
        width: 266,
        height: 130,
        type: 'logo',
    },
    overlayKetnet: { 
        name: 'overlayKetnet',
        text: { 
            text1: 'eerste tekstje in overlayKetnet',
            text2: 'eerste tekstje'
        }, 
        bot: {
            "render-status": 'ready',
            aep: '/path/to/proper/aep/file.aep'
        },
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay'
    },
    overlayStubru: { 
        name: 'overlayStubru',
        text: { 
            text1: 'eerste tekstje in overlayStubru',
            text2: 'eerste tekstje'
        },
        bot: {
            "render-status": 'ready',
            aep: '/path/to/proper/aep/file.aep'
        },
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
    },    
}
