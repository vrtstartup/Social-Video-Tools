/* 
Don't forget to set the process environment variables for the server and the worker(s)
when switching between databases
*/

import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import config from './config';

export default function() {
    // development database connection

    if( config.env != 'production'){
        
        const firebaseDevConfig:Object = {
            firebaseConfig: {
                apiKey: "AIzaSyAOsjXWW-1EBeHJX5hHz7dhDRuGYsrchNU",
                authDomain: "socialvideotool-dev.firebaseapp.com",
                databaseURL: "https://socialvideotool-dev.firebaseio.com",
                storageBucket: "socialvideotool-dev.appspot.com",
                messagingSenderId: "82496228852"
            },

            firebaseAuthConfig: {
                provider: AuthProviders.Custom,
                method: AuthMethods.Password
            }
            
        } 
        return  firebaseDevConfig
    } 

    // production database connection
    const firebaseProdConfig:Object = {
        firebaseConfig: {
            apiKey: "AIzaSyD3BnxjYmXHrP7zUPn8PxXQ1H-SbEzZwsY",
            authDomain: "socialvideotool.firebaseapp.com",
            databaseURL: "https://socialvideotool.firebaseio.com",
            storageBucket: "socialvideotool.appspot.com",
            messagingSenderId: "796211105673"
        },

        firebaseAuthConfig: {
            provider: AuthProviders.Custom,
            method: AuthMethods.Password
        }
        
    }
    return  firebaseProdConfig
    
}