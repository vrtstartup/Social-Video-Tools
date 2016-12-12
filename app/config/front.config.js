// define configuration for both environments
const firebaseConfig = {
    development: {
        apiKey: "AIzaSyAOsjXWW-1EBeHJX5hHz7dhDRuGYsrchNU",
        authDomain: "socialvideotool-dev.firebaseapp.com",
        databaseURL: "https://socialvideotool-dev.firebaseio.com",
        storageBucket: "socialvideotool-dev.appspot.com",
        messagingSenderId: "82496228852"
    },
    production: {
        apiKey: "AIzaSyD3BnxjYmXHrP7zUPn8PxXQ1H-SbEzZwsY",
        authDomain: "socialvideotool.firebaseapp.com",
        databaseURL: "https://socialvideotool.firebaseio.com",
        storageBucket: "socialvideotool.appspot.com",
        messagingSenderId: "796211105673"
    }
}

let exportConfig = {};
const env = process.env.NODE_ENV;
const port = process.env.PORT || '3000'

// check if the env var NODE_ENV has been set. 
// This will be false on the CircleCI build server, but properly on a developers machine running Webpack
if(!env && !(env==='development' || env==='production')){ 
    exportConfig = firebaseConfig[env];
} else {
    // when no env var is available, check wether or not URI contains the string 'dev'
    // exportConfig = (window.location.hostname.indexOf('dev') > -1) ? firebaseConfig.development : firebaseConfig.production;
    console.log(process.env);
    console.log(process.env.CIRCLE_BRANCH);
    exportConfig = (process.env.CIRCLE_BRANCH === 'develop') ? firebaseConfig.development : firebaseConfig.production;
}

module.exports = {
    firebaseApp: exportConfig,
    port: port
};