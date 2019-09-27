var config = {
    production: 'mongodb://localhost/cs_grad_data',
    development: 'mongodb://localhost/cs_grad_data-dev',
    testing: 'mongodb://localhost/cs_grad_data-test',
    port: (process.env.MONGODB_PASSWORD) ? 8080 : 8080,
    host: (process.env.MONGODB_PASSWORD) ? '0.0.0.0' : '127.0.0.1'
}

module.exports = config;