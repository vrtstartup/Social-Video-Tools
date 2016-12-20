export default {
    defaultSubtitle: {
        key: 'defaultSubtitle',
        imageUrl: './assets/overlay/title_01.gif',
        name: 'defaultSubtitle',
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
        type: 'subtitle',
        templateCss: '<style>#defaultSubtitle.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="defaultSubtitle" class="wrapper"><div>%textInpt01%</div></div>',
    },
    subtitleTwo: {
        key: 'subtitleTwo',
        imageUrl: './assets/overlay/title_01.gif',
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
        type: 'subtitle',
        templateCss: '<style>#DeredactieBackdrop.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="DeredactieBackdrop" class="wrapper"><div>%textInpt01%</div></div>',
    },
    subtitleThree: {
        key: 'subtitleThree',
        imageUrl: './assets/overlay/title_01.gif',
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
        type: 'subtitle',
        templateCss: '<style>#subtitDeredactieMarkeringle.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="subtitDeredactieMarkeringle" class="wrapper"><div>%textInpt01%</div></div>',
    },
    overlayKetnet: { 
        key: 'overlayKetnet',
        name: 'overlayKetnet',
        imageUrl: './assets/overlay/title_01.gif',
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
        key: 'overlayStubru',
        name: 'overlayStubru',
        imageUrl: './assets/overlay/title_01.gif',
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
        templateCss: '<style>#overlayStubru.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="overlayStubru" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',        
    },  

    testTemplate: { 
        key: 'testTemplate',
        name: 'testTemplate',
        imageUrl: './assets/overlay/title_01.gif',
        type: 'overlay',
        duration: 5,
        bot: {
            "render-status": 'ready',
            aep: 'D:\\videoTemplater\\dropbox\\ae\\Templater\\template.aep',
            bot: 'render',
            module: 'jpg2000',
            output: 'DISISEENTEST/clips/something',
            color1: '1B2A36',
            color2: '4CBF23',
            Text1:' {{off}}',
            LowText:' {{off}}',
            HighText:' {{off}}',
            BigText:' {{off}}',
            HighlightText:' {{off}}',
            Text2AK:' {{off}}',
            Text4AK:' {{off}}',
            Text5:' {{off}}',
        },
        text: {
            Text2DR: {
                label: 'Title',
                text: 'Hier komt de title',
                layerId: 'Text2DR',
                key: 'Text2DR',
            }, 
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
        templateCss: '<style>#testTemplate.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="testTemplate" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',
    },

    bumper: {
        key: 'bumper', 
        imageUrl: './assets/bumper/deredactie_01.gif',
        duration: 7,
        transitionDuration: 3,
        type: 'outro',
    },
    bumper2: {
        key: 'bumper2', 
        imageUrl: './assets/bumper/deredactie_01.gif',
        duration: 7,
        transitionDuration: 3,
        type: 'outro',
    },
    logo: {
        key:'logo',
        imageUrl: './assets/logo/deredactie_01.gif',
        scale: 1,
        width: 266,
        height: 130,
        type: 'logo',
    },
    logo2: {
        key:'logo2',
        imageUrl: './assets/logo/deredactie_01.gif',
        scale: 1,
        width: 266,
        height: 130,
        type: 'logo',
    },
}
