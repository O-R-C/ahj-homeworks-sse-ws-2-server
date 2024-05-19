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
      console.log('🚀 ~ this.#storage.get():', this.#storage.get())

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
      this.#storage.push(new Instance(id))
      ws.send(this.#getStringData('CREATED', { id, INFO: 'Created' }))
    }, this.#workTimer)
  }

  /**
   * Handles START event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleSTART(payload, ws) {
    const { id } = payload
    ws.send(this.#getStringData('Processing', { id: id, INFO: 'Received "Start command"' }))

    setTimeout(() => {
      const instance = this.#storage.findByProperty('id', id)

      if (!instance) {
        ws.send(this.#getStringData('ERROR', { id: id, INFO: 'Instance not found' }))
        return
      }

      if (instance.status === 'started') {
        ws.send(this.#getStringData('ERROR', { id: id, INFO: 'Instance already started' }))
        return
      }

      instance.status = 'started'
      ws.send(this.#getStringData('STARTED', { id: id, INFO: 'Started' }))
    }, this.#workTimer)
  }

  /**
   * Handles STOP event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleSTOP(payload, ws) {
    const { id } = payload
    ws.send(this.#getStringData('Processing', { id: id, INFO: 'Received "Stop command"' }))

    setTimeout(() => {
      const instance = this.#storage.findByProperty('id', id)

      if (!instance) {
        ws.send(this.#getStringData('ERROR', { id: id, INFO: 'Instance not found' }))
        return
      }

      if (instance.status === 'stopped') {
        ws.send(this.#getStringData('ERROR', { id: id, INFO: 'Instance already stopped' }))
        return
      }

      instance.status = 'stopped'
      ws.send(this.#getStringData('STOPPED', { id: id, INFO: 'Stopped' }))
    }, this.#workTimer)
  }

  /**
   * Handles REMOVE event
   * @private
   * @param {Object} payload - Payload data
   */
  #handleREMOVE(payload, ws) {
    const { id } = payload
    ws.send(this.#getStringData('Processing', { id: id, INFO: 'Received "Remove command"' }))

    setTimeout(() => {
      const instance = this.#storage.findByProperty('id', id)

      if (!instance) {
        ws.send(this.#getStringData('ERROR', { id: id, INFO: 'Instance not found' }))
        return
      }

      this.#storage.delete(id)
      ws.send(this.#getStringData('REMOVED', { id: id, INFO: 'Removed' }))
    }, this.#workTimer)
  }
}

module.exports = CloudDashboard
