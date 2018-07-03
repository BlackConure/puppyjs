(async () => {
  'use strict'
  const ws = new WebSocket('ws://localhost:8080/ws')

  ws.onopen = () => ws.send('connected')

  let wsCounter = 0

  $('.test').append('<br><br><div class="ws-count">Responses from WS: ' + wsCounter + '</div>')

  $('.test').append('<br><br><div class="ws-last">Latest response from WS: </div>')

  ws.onmessage = ev => {
    wsCounter++

    $('.ws-count').text('Responses from WS: ' + wsCounter)
    $('.ws-last').html('Latest response from WS: <span class="ws-data">' + ev.data + '</span>')
  }
})()
