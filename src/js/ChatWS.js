const { v4: uuidv4 } = require('uuid')

/**
 * Class represents a WebSockets chat
 *
 * @class ChatWS
 */
class ChatWS {
  /**
   * WebSocket server instance
   * @private
   */
  #wss

  /**
   * Chat messages
   * @private
   */
  #chat

  /**
   * List of user names
   * @private
   */
  #userList

  /**
   * List of connected clients
   * @private
   */
  #clients

  /**
   * Constructs an instance of ChatWS
   * @param {WS.Server} wsServer - WebSocket server
   * @param {UserList} UserList - List of user names
   * @param {ArrayStorage} ArrayStorage - Chat messages
   * @throws {Error} If any of the arguments are missing
   */
  constructor(wsServer, UserList, ArrayStorage) {
    !wsServer && this.#throwError('wsServer is required')
    !UserList && this.#throwError('userList is required')
    !ArrayStorage && this.#throwError('arrayStorage is required')

    this.#userList = new UserList()
    this.#wss = wsServer
    this.#chat = new ArrayStorage([{ username: 'Admin', timestamp: Date.now(), text: 'Welcome' }])
    this.#clients = {}
  }

  /**
   * Throws an error if the argument is missing
   * @private
   * @param {string} error - Error message
   */
  #throwError(error) {
    throw new Error(error)
  }

  /**
   * Initializes the WebSocket connection
   * @public
   */
  init() {
    this.#connect()
  }

  /**
   * Handles a new connection
   * @private
   */
  #connect() {
    this.#wss.on('connection', (ws) => {
      ws.send(this.#getStringData('UsersList', this.#userList.users))
      ws.send(this.#getStringData('Chat', this.#chat.get()))

      const id = uuidv4()

      this.#clients[id] = { ws, id }

      ws.on('message', (data) => {
        this.#handleData(data, id)
      })

      ws.on('close', () => this.#handleCloseConnection(this.#clients[id]))
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
  #handleData(data, id) {
    const { event, payload } = JSON.parse(data)
    this.#eventHandlers[event] && this.#eventHandlers[event](payload, id)
    !this.#eventHandlers[event] && console.error(`Event ${event} not found`)
  }

  /**
   * List of event handlers
   * @private
   */
  #eventHandlers = {
    UserJoin: (payload, id) => this.#userJoin(payload, id),
    UserLeave: (payload, id) => this.#userLeave(payload, id),
    Chat: (payload, id) => this.#handleChat(payload, id),
  }

  /**
   * Adds a user to the list
   * @private
   * @param {string} userName - User name
   * @param {string} id - Client ID
   */
  #userJoin(userName, id) {
    this.#clients[id].userName = userName
    this.#userList.add(userName)
    this.#sendAll('UsersList', this.#userList.users)
  }

  /**
   * Removes a user from the list
   * @private
   * @param {string} userName - User name
   * @param {string} id - Client ID
   */
  #userLeave(userName, id) {
    id && delete this.#clients[id]?.userName
    this.#userList.delete(userName)
  }

  /**
   * Handles a new chat message
   * @private
   * @param {string} message - New chat message
   *
   */
  #handleChat(message, id) {
    this.#chat.push(message)
    this.#wss.clients.forEach((client) => {
      if (client !== this.#clients[id].ws && client.readyState === 1) {
        client.send(this.#getStringData('Message', message))
      }
    })
  }

  /**
   * Closes the connection
   * @param {string} id - Client ID
   * @param {string} userName - User name
   */
  #handleCloseConnection({ id, userName }) {
    delete this.#clients[id]
    this.#userLeave(userName)
    this.#sendAll('UsersList', this.#userList.users)
  }
}

module.exports = ChatWS
