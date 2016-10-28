export const fbConfig = { 
    'serviceAccount': {
        'type': process.env.FIREBASE_TYPE,
        'project_id': process.env.FIREBASE_PROJECT_ID,
        'private_key_id': process.env.FIREBASE_PRIVATE_KEY_ID,
        'private_key': process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // solves double backslash issue when pasting newlinebreaks in terminal
        'client_email': process.env.FIREBASE_CLIENT_EMAIL,
        'client_id': process.env.FIREBASE_CLIENT_ID,
        'auth_uri': process.env.FIREBASE_AUTH_URI,
        'token_uri': process.env.FIREBASE_TOKEN_URI,
        'auth_provider_x509_cert_url': process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        'client_x509_cert_url': process.env.FIREBASE_CLIENT_X509_CERT_URL
    }, 
        'databaseURL': process.env.FIREBASE_DATABASEURL,
}