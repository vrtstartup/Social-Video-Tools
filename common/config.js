const env = process.env.NODE_ENV || 'development';

// Service message for console in case of unknown environment
if (env !== 'development' && env !== 'production' && env !== 'staging') {
    console.log('Use: NODE_ENV=[development | production]');
    console.log('Quiting...');
    process.exit();
}

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '3000',
}

module.exports = config;
