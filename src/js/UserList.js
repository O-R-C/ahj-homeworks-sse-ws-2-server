/**
 * Class represents a set of user names
 *
 * @class UserList
 */
class UserList {
  /**
   * Set of user names
   *
   * @member {Set<string>} #userList
   */
  #userList
  /**
   * Constructor
   * @param {string[]} [users=[]] - initial user names
   */
  constructor(users = []) {
    this.#userList = new Set(users)
  }

  /**
   * Returns array of user names
   *
   * @member {string[]} users
   */
  get users() {
    return [...this.#userList.keys()]
  }

  /**
   * Add user name to list
   * @param {string} userName - user name to add
   */
  add(userName) {
    this.#userList.add(userName)
  }

  /**
   * Remove user name from list
   * @param {string} userName - user name to remove
   */
  delete(userName) {
    this.#userList.delete(userName)
  }

  /**
   * Clear list
   */
  clear() {
    this.#userList.clear()
  }

  /**
   * Returns total number of users
   * @returns {number} total number of users
   */
  get totalUsers() {
    return this.#userList.size
  }

  /**
   * Checks if user name exists in list
   * @param {string} userName - user name to check
   * @returns {boolean} true if user name exists, otherwise false
   */
  has(userName) {
    return this.#userList.has(userName)
  }
}

module.exports = UserList
