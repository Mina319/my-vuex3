let Vue = null

class Store {
  constructor (options) {
    const { state = {} } = options
    // 使用 observable 响应化处理
    this.state = Vue.observable(state)
    // 初始化一个空对象
    this.getters = {}

    // 遍历getters的键值对
    for (const [key, value] of Object.entries(this.getters)) {
      Object.defineProperty(this.getters, key, {
        get: () => value(this.state)
      })
    };

    const { mutations = {} } = options
    this.mutations = mutations

    const { actions = {} } = options
    this.actions = actions
  }

  /**
     * 同步修改state数据
     *
     * @param {string} type - 表示要调用的 mutation 的函数名
     * @param {*} payload - 传递给 mutation 的数据
     */
  commit (type, payload) {
    // 检查 mutations 中是否存在该 type
    if (!this.mutations[type]) {
      throw new Error(`Mutation "${type}" not found`)
    }
    this.mutations[type](this.state, payload)
  }

  dispatch (type, payload) {
    // 触发异步操作action
    if (!this.actions[type]) {
      throw new Error(`Action "${type}" not found`)
    }
    return this.actions[type]({ commit: this.commit, state: this.state }, payload)
  }
}

function install (_Vue) {
  Vue = _Vue
  // 实现每一个组件，都能通过 this 调用 $store
  Vue.mixin({
    beforeCreate () {
      // 通过 this.$options 可以获取  new Vue({参数})传递的参数
      if (this.$options && this.$options.store) {
        // vue的原型上挂载 store （store 的实例）
        this.$store = this.$options.store
        // 等同于 Vue.prototype.$store = this.$options.store
      }
    }
  })
}

export default {
  Store,
  install
}
