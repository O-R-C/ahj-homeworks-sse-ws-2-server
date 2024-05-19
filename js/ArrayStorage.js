/**
 * Class represents a simple array storage
 *
 * @class ArrayStorage
 *
 * @param {Array} [storage=[]] - initial array of items
 */
class ArrayStorage {
  #storage

  /**
   * Constructor
   *
   * @param {Array} [storage=[]] - initial array of items
   */
  constructor(storage = []) {
    this.#storage = storage
  }

  /**
   * Returns the length of the array
   *
   * @returns {number} array length
   */
  get length() {
    return this.#storage.length
  }

  /**
   * Returns the array of items
   *
   * @returns {Array} array of items
   */
  get() {
    return this.#storage
  }

  /**
   * Finds item by property
   *
   * @param {string} property - property name
   * @param {*} value - value to search for
   * @returns {Object} item if found, otherwise undefined
   */
  findByProperty(property, value) {
    return this.#storage.find((item) => item[property] === value)
  }

  /**
   * Adds item to the array
   *
   * @param {*} item - item to add
   */
  push(item) {
    this.#storage.push(item)
  }

  /**
   * Removes item from the array
   *
   * @param {*} id - id of the item to remove
   */
  delete(id) {
    const index = this.#storage.indexOf((item) => item.id === id)
    this.#storage.splice(index, 1)
  }

  /**
   * Clears the array storage.
   *
   * @return {void}
   */
  clear() {
    this.#storage = []
  }
}

module.exports = ArrayStorage
