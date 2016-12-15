export default {
    subtitle: {
        name: 'subtitle',
        ass: {
            fontname: 'arial',
            fontsize: 24,
            primaryColour: '0xFFFFFF',
            secondaryColour: '0xFFFFFF',
            outlineColour: '0xFFFFFF',
            backColour: '0x000000',
            bold: true,
            italic: true,
            underline: true,
            strikeout: true,
        },
        text: {
            textInpt01: {
                label: 'Title',
                text: 'Hier komt de subtitle',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
        },
        aeTemplate: './testTemplate.aep',
        imageUrl: 'http://placehold.it/250x250',
        type: 'subtitle',
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0); color:green; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div></div>',
    },
    subtitleTwo: {
        name: 'DeredactieBackdrop',
        ass: {
            fontname: 'arial',
            fontsize: 24,
            primaryColour: '0xFFFFFF',
            secondaryColour: '0xFFFFFF',
            outlineColour: '0xFFFFFF',
            backColour: '0x000000',
            bold: false,
            italic: false,
            underline: false,
            strikeout: false,
        },
        text: {
            textInpt01: {
                label: 'Title',
                text: 'Hier komt de subtitle',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
        },
        aeTemplate: './testTemplate.aep',
        imageUrl: 'http://placehold.it/250x250',
        type: 'subtitle',
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0); color:yellow; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div></div>',
    },
    subtitleThree: {
        name: 'subtitDeredactieMarkeringle',
        ass: {
            fontname: 'arial',
            fontsize: 28,
            primaryColour: '0xFFFFFF',
            secondaryColour: '0xFFFFFF',
            outlineColour: '0xFFFFFF',
            backColour: '0x000000',
            bold: true,
            italic: true,
            underline: false,
            strikeout: false,
        },
        text: {
            textInpt01: {
                label: 'Title',
                text: 'Hier komt de subtitle',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
        },
        aeTemplate: './testTemplate.aep',
        imageUrl: 'http://placehold.it/250x250',
        type: 'subtitle',
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0); color:blue; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div></div>',
    },
    overlayKetnet: { 
        name: 'overlayKetnet',
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
        duration: 5,
        bot: {
            "render-status": 'ready',
            aep: '/path/to/proper/aep/file.aep'
        },
        text: {
            textInpt01: {
                label: 'overlayKetnet: Title',
                text: 'overlayKetnet: Hier komt de title',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
            textInpt02: {
                label: 'overlayKetnet: Subtitle',
                text: 'overlayKetnet: Hier komt de subtitle',
                layerId: 'textInpt02',
                key: 'textInpt02',
            } 
        },
        layer: {            
            layer01: { 
                visible: 'false',
                layerId: 'layer01',
                key: 'layer01'
            }, 
            layer02: { 
                visible: 'false',
                layerId: 'layer02',
                key: 'layer02'
            }
        },
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',
    },
    overlayStubru: { 
        name: 'overlayStubru',
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
        duration: 7,
        bot: {
            "render-status": 'ready',
            aep: '/path/to/proper/aep/file.aep'
        },
        text: {
            textInpt01: {
                label: 'overlayStubru: Title',
                text: 'overlayStubru: Hier komt de title',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
            textInpt02: {
                label: 'overlayStubru: Subtitle',
                text: 'overlayStubru: Hier komt de subtitle',
                layerId: 'textInpt02',
                key: 'textInpt02',
            } 
        },
        layer: {            
            layer01: { 
                visible: 'false',
                layerId: 'layer01',
                key: 'layer01'
            }, 
            layer02: { 
                visible: 'false',
                layerId: 'layer02',
                key: 'layer02'
            }
        },
        templateCss: '<style>.wrapper{ background: rgba(0,0,0,0); color:pink; }</style>',
        templateHtml: '<div id="overlayStubru" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',        
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
