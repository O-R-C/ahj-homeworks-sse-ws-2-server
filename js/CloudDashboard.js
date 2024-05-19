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
  #sendAll(event, payload) {
    this.#wss.clients.forEach((client) => {
      client.send(this.#getStringData(event, payload))
    })
  }

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
    ws.send(this.#getStringData('Processing', { id, INFO: 'Received "Create command"' }))
    setTimeout(() => {
      this.#storage.push(new Instance(payload))
      ws.send(this.#getStringData('CREATED', { id, INFO: 'Created' }))
    }, 20000)
  }

  /**
   * Handles START event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleSTART(payload, ws) {
    ws.send(this.#getStringData('Processing', { id: payload, INFO: 'Received "Start command"' }))
    setTimeout(() => {
      this.#storage.findByProperty('id', payload).status = 'started'
      ws.send(this.#getStringData('STARTED', { id: payload, INFO: 'Started' }))
    }, 20000)
  }

  /**
   * Handles STOP event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleSTOP(payload, ws) {
    ws.send(this.#getStringData('Processing', { id: payload, INFO: 'Received "Stop command"' }))
    setTimeout(() => {
      this.#storage.findByProperty('id', payload).status = 'stopped'
      ws.send(this.#getStringData('STOPPED', { id: payload, INFO: 'Stopped' }))
    }, 20000)
  }

  /**
   * Handles REMOVE event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleREMOVE(payload, ws) {
    ws.send(this.#getStringData('Processing', { id: payload, INFO: 'Received "Remove command"' }))
    setTimeout(() => {
      this.#storage.delete(payload)
      ws.send(this.#getStringData('REMOVED', { id: payload, INFO: 'Removed' }))
    }, 20000)
  }
}

module.exports = CloudDashboard
