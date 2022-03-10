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
const sleepTime = isProduction ? 5*60*1000 : 5*1000

async function main(protocol) {
  const http = protocol
  while (true) {
    process.stdout.write(`${new Date()} Ping #${times++} - `)

    const req = http.request(options, res => {
      process.stdout.write(`statusCode: ${res.statusCode} - `)

      let data2end = false
      res.on('data', async (d) => {
        data2end = true // we send data to the end event because on.'data' fires twice for some reason
      })
      res.on('end', async () => {
        if (data2end) {
          process.stdout.write(`${options.hostname} is up!\n`)
          if (lastStatus == DOWN) {
            const the_email = generateDeveloperEmail('✅ Server is Back Up', "Server is now back up. Sent from uptime.js.")
            const email_res = await send(the_email)
            lastStatus = UP
          }
          data2end = false
        }
      })

    })
    
    req.on('error', async (error) => {
      console.error(error)
      if (lastStatus == UP) {
        const the_email = generateDeveloperEmail('❌ Server Unreachable', "Please check server logs to see reason for error. Sent from uptime.js.")
        const email_res = await send(the_email)
        lastStatus = DOWN
      }
    })
    
    req.end()
    await sleep(sleepTime)
  }
}

main(process.env.mode == 'production' ? https : http)
