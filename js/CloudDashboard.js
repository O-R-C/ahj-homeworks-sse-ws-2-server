const { v4: uuidv4 } = require('uuid')
const Instance = require('./Instance')

/**
 * Cloud Dashboard
 *
 * @class CloudDashboard
 */
class CloudDashboard {
  #wss
  #storage
  #workTimer = 2000

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
        this.#handleData(data, ws)
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
    return JSON.stringify({ event, payload })
  }

  /**
   * Sends data to all clients
   * @private
   * @param {string} event - Event name
   * @param {*} payload - Payload data
   */
  // #sendAll(event, payload) {
  //   this.#wss.clients.forEach((client) => {
  //     client.send(this.#getStringData(event, payload))
  //   })
  // }

  /**
   * Handles incoming data from the client
   * @private
   * @param {string} data - Incoming data
   */
  #handleData(data, ws) {
    const { event, payload } = JSON.parse(data)
    this.#eventHandlers[event] && this.#eventHandlers[event](payload, ws)
    !this.#eventHandlers[event] && console.error(`Event ${event} not found`)
  }

  /**
   * List of event handlers
   * @private
   */
  #eventHandlers = {
    CREATE: (payload, ws) => this.#handleCREATE(payload, ws),
    START: (payload, ws) => this.#handleSTART(payload, ws),
    STOP: (payload, ws) => this.#handleSTOP(payload, ws),
    REMOVE: (payload, ws) => this.#handleREMOVE(payload, ws),
  }

  /**
   * Handles CREATE event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleCREATE(payload, ws) {
    const id = uuidv4()

    this.#sendProcessing(id, ws, 'CREATE')

    setTimeout(() => {
      this.#storage.push(new Instance(id))
      this.#sendResult(id, ws, 'CREATED')
    }, this.#workTimer)
  }

  /**
   * Handles START event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleSTART(payload, ws) {
    const { id } = payload
    this.#sendProcessing(id, ws, 'START')

    setTimeout(() => {
      const instance = this.#storage.findByProperty('id', id)

      if (!instance) {
        this.#sendError(id, ws, 'Instance not found')
        return
      }

      if (instance.status === 'started') {
        this.#sendError(id, ws, 'Instance already started')
        return
      }

      instance.status = 'started'
      this.#sendResult(id, ws, 'STARTED')
    }, this.#workTimer)
  }

  /**
   * Handles STOP event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleSTOP(payload, ws) {
    const { id } = payload
    this.#sendProcessing(id, ws, 'STOP')

    setTimeout(() => {
      const instance = this.#storage.findByProperty('id', id)

      if (!instance) {
        this.#sendError(id, ws, 'Instance not found')
        return
      }

      if (instance.status === 'stopped') {
        this.#sendError(id, ws, 'Instance already stopped')
        return
      }

      instance.status = 'stopped'
      this.#sendResult(id, ws, 'STOPPED')
    }, this.#workTimer)
  }

  /**
   * Handles REMOVE event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleREMOVE(payload, ws) {
    const { id } = payload
    this.#sendProcessing(id, ws, 'REMOVE')

    setTimeout(() => {
      const instance = this.#storage.findByProperty('id', id)

      if (!instance) {
        this.#sendError(id, ws, 'Instance not found')
        return
      }

      this.#storage.delete(id)
      this.#sendResult(id, ws, 'REMOVED')
    }, this.#workTimer)
  }

  /**
   * Sends processing message to the client
   * @private
   * @param {string} id - Instance id
   * @param {Object} ws - Websocket
   * @param {string} type - Command type
   */
  #sendProcessing(id, ws, type) {
    ws.send(this.#getStringData('Processing', { id: id, INFO: `Received "${type} command"` }))
  }

  /**
   * Sends error message to the client
   * @private
   * @param {string} id - Instance id
   * @param {Object} ws - Websocket
   * @param {string} error - Error message
   */
  #sendError(id, ws, error) {
    ws.send(this.#getStringData('ERROR', { id: id, INFO: error }))
  }

  /**
   * Sends result message to the client
   * @private
   * @param {string} id - Instance id
   * @param {Object} ws - Websocket
   * @param {string} result - Result message
   */
  #sendResult(id, ws, result) {
    ws.send(this.#getStringData(result, { id: id, INFO: this.#getCapitalizedWord(result) }))
  }

  #getCapitalizedWord(word) {
    return word.charAt(0) + word.slice(1).toLowerCase()
  }
}

module.exports = CloudDashboard
