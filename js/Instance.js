/**
 * Instance of a virtual machine
 *
 * @class Instance
 * @extends {Object}
 * @property {string} id - instance id
 */
class Instance {
  /**
   * Constructor
   *
   * @param {string} id - instance id
   */
  constructor(id) {
    this.id = id
    this.status = 'stopped'
  }
}

module.exports = Instance
