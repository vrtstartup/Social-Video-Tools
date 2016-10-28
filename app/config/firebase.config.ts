/* 
Don't forget to set the process environment variables for the server and the worker(s)
when switching between databases
*/

export default function() {
    // development database connection
    if( process.env.NODE_ENV != 'production'){
        
        const firebaseDevConfig = {
            apiKey: "AIzaSyAOsjXWW-1EBeHJX5hHz7dhDRuGYsrchNU",
            authDomain: "socialvideotool-dev.firebaseapp.com",
            databaseURL: "https://socialvideotool-dev.firebaseio.com",
            storageBucket: "socialvideotool-dev.appspot.com",
            messagingSenderId: "82496228852"
        } 
        return  firebaseDevConfig

        } 
    // production database connection
    const firebaseProdConfig = {
        apiKey: "AIzaSyD3BnxjYmXHrP7zUPn8PxXQ1H-SbEzZwsY",
        authDomain: "socialvideotool.firebaseapp.com",
        databaseURL: "https://socialvideotool.firebaseio.com",
        storageBucket: "socialvideotool.appspot.com",
        messagingSenderId: "796211105673"
    }
    return  firebaseProdConfig
    
}