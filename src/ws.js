'use strict'
const path = require('path')
const chokidar = require('chokidar')
const expressuws = require('express-ws')

const charcoal = require('./charcoal')

let timeouts = []
let intervals = []
let wsDefaultResponses = {}

function initialize (wsApp, internalApp) {
  const expressUms = expressuws(wsApp) // eslint-disable-line

  const wss = expressUms.getWss()

  const wsFile = path.resolve(process.cwd(), process.env.WS)

  chokidar
    .watch(wsFile, {usePolling: true})
    .on('all', (event, path) => {
      if (event !== 'add' && event !== 'change') {
        return
      }

      charcoal.log(`Puppy WS: Changes detected, reloading ${process.env.WS} file`)

      delete require.cache[require.resolve(path)]

      let newResponses
      try {
        newResponses = require(path)

        wsDefaultResponses = Object
          .keys(newResponses)
          .map(key => Object.assign(newResponses[key], {label: key}))

        timeouts.forEach(timeout => clearTimeout(timeout))
        intervals.forEach(interval => clearInterval(interval))

        timeouts = []
        intervals = []

        charcoal.debug(`Puppy WS: ${process.env.WS} loaded. Refresh browser to view changes`)
      } catch (e) {
        charcoal.error(`Puppy WS: failed to load default responses from ${process.env.WS}`)
        charcoal.error(e)
      }
    })

  wsApp.ws(process.env.WS_URL, ws => {
    charcoal.debug('Puppy WS: Client connected')

    wsDefaultResponses
      .forEach(event => {
        const timeout = setTimeout(async () => {
          const _emitMessage = async message => {

            if (ws.readyState !== 1) {
              charcoal.debug('Puppy WS: Clearing previous timeout and interval for event due to socket disconnection')

              clearTimeout(timeout)
              clearInterval(interval)
              return
            }

            if (typeof message === 'function') {
              try {
                message = await message()
              } catch (err) {
                charcoal.error('Puppy WS: Something went wrong while executing the function')
                charcoal.error(err)

                clearTimeout(timeout)
                clearInterval(interval)
                return
              }
            }

            charcoal.debug(`Puppy WS: Emitting [${event.label}]`)
            charcoal.debug(JSON.stringify(message))

            ws.send(JSON.stringify(message))
          }

          if (!event.interval) {
            return _emitMessage(event.message)
          }

          const interval = setInterval(() => _emitMessage(event.message), event.interval)

          intervals.push(interval)
        }, event.delay || 0)

        timeouts.push(timeout)
      })

    ws.on('message', message => {
      charcoal.debug(`Puppy WS: Received message: ${message}`)
    })
  })

  internalApp.post('/emit', (req, res) => {
    let message = req.body

    wss.clients.forEach(client => client.send(JSON.stringify(message)))

    setTimeout(() => res.send('OK'), 50)
  })
}

module.exports = initialize
