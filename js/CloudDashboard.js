class CloudDashboard {
  #wss
  #storage

  constructor(wss, storage) {
    this.#wss = wss
    this.#storage = storage
  }

  init() {
    this.#connect()
  }

  /**
   * Handles a new connection
   * @private
   */
  #connect() {
    this.#wss.on('connection', (ws) => {
      ws.send(this.#getStringData('Instances', this.#storage.get()))

      ws.on('message', (data) => {
        console.log('Received: %s', data)
      })

      ws.on('close', () => {
        console.log('Client disconnected')
      })

      ws.on('error', (err) => {
        console.error(err)
      })
    })
  }

  /**
   * Sends data to the client
   * @private
   * @param {string} event - Event name
   * @param {*} payload - Payload data
   */
  #getStringData(event, payload) {
    console.log('🚀 ~ event:', event)
    return JSON.stringify({ event, payload })
  }
}

module.exports = CloudDashboard
