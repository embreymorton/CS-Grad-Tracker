const http = require('http')
const https = require('https')
require('./env').load()
const {send, generateDeveloperEmail} = require('./controllers/email')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const UP = true
const DOWN = false

let times = 0
let lastStatus = UP

const isProduction = process.env.mode == 'production'
const options = isProduction ? 
  {
    hostname: 'csgrad.cs.unc.edu',
    path: '',
    method: 'GET'
  }
:
  {
    hostname: 'localhost',
    port: 8081,
    path: '',
    method: 'GET'
  }

async function main(protocol) {
  const http = protocol
  while (true) {
    console.log(`Ping #${times}`)

    const req = http.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`)
    
      res.on('data', async d => {
        process.stdout.write('Site is up!\n')
        if (lastStatus == DOWN) {
          const the_email = generateDeveloperEmail('UP')
          await send(the_email)
          lastStatus = UP
        }
      })
    })
    
    req.on('error', async (error) => {
      console.error(error)
      if (lastStatus == UP) {
        const the_email = generateDeveloperEmail('DOWN')
        await send(the_email)
        lastStatus = DOWN
      }
    })
    
    req.end()
    times++
    await sleep(5000)
  }
}

main(process.env.mode == 'production' ? https : http)