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
        type: 'subtitle',
        templateCss: '<style>.wrapper{ background: rgba(0,0,0,0.25); color:yellow; }</style>',
        templateHtml: '<div class="wrapper" id="overlayKetnet"><div>subtitle</div></div>',
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
        templateCss: '<style>.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div class="wrapper" id="overlayKetnet"><div id="textInpt01">textInpt01</div><div id="textInpt02">textInpt02</div></div>',
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
        templateCss: '<style>.wrapper{ background: rgba(0,0,0,0.25); color:pink; }</style>',
        templateHtml: '<div class="wrapper" id="overlayStubru"><div id="textInpt01">textInpt01</div><div id="textInpt02">textInpt02</div></div>',        
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
