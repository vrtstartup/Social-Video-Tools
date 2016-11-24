export default {
    subtitle: {
        name: 'subtitle',
        text: {
            textInpt01: {
                label: 'Title',
                text: 'Hier komt de subtitle',
                layerId: 'layername'
            }, 
        },
        aeTemplate: './testTemplate.aep',
        imageUrl: 'http://placehold.it/250x250',
        type: 'subtitle'
    },
    overlayKetnet: { 
        name: 'overlayKetnet',
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
        bot: {
            "render-status": 'ready',
            aep: '/path/to/proper/aep/file.aep'
        },
        text: {
            textInpt01: {
                label: 'overlayKetnet: Title',
                text: 'overlayKetnet: Hier komt de title',
                layerId: 'textInpt01'
            }, 
            textInpt02: {
                label: 'overlayKetnet: Subtitle',
                text: 'overlayKetnet: Hier komt de subtitle',
                layerId: 'textInpt02'
            } 
        },
        layer: {            
            layer01: { visible: 'false'}, 
            layer02: { visible: 'false'}
        },
    },
    overlayStubru: { 
        name: 'overlayStubru',
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
        bot: {
            "render-status": 'ready',
            aep: '/path/to/proper/aep/file.aep'
        },
        text: {
            textInpt01: {
                label: 'overlayStubru: Title',
                text: 'overlayStubru: Hier komt de title',
                layerId: 'textInpt01'
            }, 
            textInpt02: {
                label: 'overlayStubru: Subtitle',
                text: 'overlayStubru: Hier komt de subtitle',
                layerId: 'textInpt02'
            } 
        },
        layer: {            
            layer01: { visible: 'false'}, 
            layer02: { visible: 'false'}
        },        
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
}
