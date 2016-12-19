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
        name: 'DeredactieMarkering',
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
    lowText: { 
        name: 'Low Text De Redactie',
        imageUrl: 'http://placehold.it/250x250',
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
                text: 'Hier komt de title',
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
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',
    },

    highText: { 
        name: 'High Text De Redactie',
        imageUrl: 'http://placehold.it/250x250',
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
                text: 'Hier komt de title',
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
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',
    },

    bigText: { 
        name: 'Big Text De Redactie',
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
        duration: 5,
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
                text: 'Hier komt de title',
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
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',
    },

    highlightText: { 
        name: 'Highlight Text De Redactie',
        imageUrl: 'http://placehold.it/250x250',
        type: 'overlay',
        duration: 5,
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
                text: 'Hier komt de title',
                layerId: 'Text2DR',
                key: 'Text2DR',
            }, 
            Text3: {
                label: 'Subtitle',
                text: 'Hier komt de ondertitel',
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
        templateCss: '<style>#overlayKetnet.wrapper{ background: rgba(0,0,0,0.25); color:white; }</style>',
        templateHtml: '<div id="overlayKetnet" class="wrapper"><div>%textInpt01%</div><div>%textInpt02%</div></div>',
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
