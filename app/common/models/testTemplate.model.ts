export default {
    defaultSubtitle: {
        key: 'defaultSubtitle',
        imageUrl: './assets/overlay/title_01.gif',
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
                text: 'defaultSubtitle',
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
                text: 'subtitleTwo',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
        },
        aeTemplate: './testTemplate.aep',
        type: 'subtitle',
        templateCss: '<style>#subtitleTwo.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="subtitleTwo" class="wrapper"><div>%textInpt01%</div></div>',
    },
    subtitleThree: {
        key: 'subtitleThree',
        imageUrl: './assets/overlay/title_01.gif',
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
                text: 'subtitleThree',
                layerId: 'textInpt01',
                key: 'textInpt01',
            }, 
        },
        aeTemplate: './testTemplate.aep',
        type: 'subtitle',
        templateCss: '<style>#subtitleThree.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="subtitleThree" class="wrapper"><div>%textInpt01%</div></div>',
    },
    lowText: { 
        key: 'lowText',
        imageUrl: './assets/overlay/title_01.gif',
        type: 'overlay',
        duration: 5,
        bot: {
            "render-status": 'ready',
            bot: 'render',
            module: 'jpg2000',
            color1: '1B2A36',
            color2: '4CBF23',
        },
        text: {
            Text2DR: {
                label: 'Title',
                text: 'lowText',
                layerId: 'Text2DR',
                key: 'Text2DR',
            }, 
        },
        layers: {
            HighlightText: false,
            LowText: true,
            HighText: false,
            BigText: false
        },
        templateCss: '<style>#lowText.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="lowText" class="wrapper"><div>%Text2DR%</div>></div>',
    },
    highText: { 
        key: 'highText',
        imageUrl: './assets/overlay/title_01.gif',
        type: 'overlay',
        duration: 7,
        bot: {
            "render-status": 'ready',
            bot: 'render',
            module: 'jpg2000',
            color1: '1B2A36',
            color2: '4CBF23',
        },
        text: {
            Text2DR: {
                label: 'Title',
                text: 'highText',
                layerId: 'Text2DR',
                key: 'Text2DR',
            }, 
        },
        layers: {
            HighlightText: false,
            LowText: false,
            HighText: true,
            BigText: false
        },
        templateCss: '<style>#highText.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="highText" class="wrapper"><div>%Text2DR%</div></div>',        
    },  

    bigText: { 
        key: 'bigText',
        imageUrl: './assets/overlay/title_01.gif',
        type: 'overlay',
        duration: 7,
        bot: {
            "render-status": 'ready',
            bot: 'render',
            module: 'jpg2000',
            color1: '1B2A36',
            color2: '4CBF23',
        },
        text: {
            Text2DR: {
                label: 'Title',
                text: 'bigText',
                layerId: 'Text2DR',
                key: 'Text2DR',
            }, 
        },
        layers: {
            HighlightText: false,
            LowText: false,
            HighText: false,
            BigText: true
        },
        templateCss: '<style>#bigText.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="bigText" class="wrapper"><div>%Text2DR%</div></div>',        
    }, 

    highlightText: { 
        key: 'highlightText',
        imageUrl: './assets/overlay/title_01.gif',
        type: 'overlay',
        duration: 7,
        bot: {
            "render-status": 'ready',
            aep: 'D:\\videoTemplater\\dropbox\\ae\\Templater\\template.aep',
            bot: 'render',
            module: 'jpg2000',
            color1: '1B2A36',
            color2: '4CBF23',
        },
        text: {
            Text2DR: {
                label: 'Title',
                text: 'highlightText',
                layerId: 'Text2DR',
                key: 'Text2DR',
            }, 
            Text3: {
                label: 'Subtitle',
                text: 'highlightText',
                layerId: 'Text2DR',
                key: 'Text3',
            }, 
        },
        layers: {
            HighlightText: true,
            LowText: false,
            HighText: false,
            BigText: false
        },
        templateCss: '<style>#bigText.wrapper{ background: rgba(0,0,0,0); color:white; }</style>',
        templateHtml: '<div id="bigText" class="wrapper"><div>%Text2DR%</div><div>%Text3%</div></div>',        
    }, 
    
    bumper: {
        key: 'bumper', 
        imageUrl: './assets/bumper/deredactie_01.gif',
        duration: 7,
        transitionDuration: 3,
        type: 'outro',
        fileName: 'deredactie_1'
    },
    bumper2: {
        key: 'bumper2', 
        imageUrl: './assets/bumper/deredactie_01.gif',
        duration: 7,
        transitionDuration: 3,
        type: 'outro',
        fileName: 'deredactie_1'
    },
    logo: {
        key:'logo',
        imageUrl: './assets/logo/deredactie_01.gif',
        scale: 6,
        width: 266,
        height: 130,
        type: 'logo',
        fileName: 'deredactie_1'
    },
    logo2: {
        key:'logo2',
        imageUrl: './assets/logo/deredactie_01.gif',
        scale: 6,
        width: 266,
        height: 130,
        type: 'logo',
        fileName: 'deredactie_1'
    }    
}
