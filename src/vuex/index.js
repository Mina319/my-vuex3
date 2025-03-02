import ModuleCollection from './module-collection'
import forEachValue from './utils'

let Vue = null

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    console.assert(store._commiting, '[vuex] do mot mutate vuex store state outside mutation handlers.')
  }, { deep: true, sync: true })
}

class Store {
  constructor (options) {
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
    // strict 模式
    const { strict = false } = options
    this.strict = strict
    // 添加committing 状态
    this._commiting = false
    this._modules = new ModuleCollection(options)
    this._wrappedGetters = Object.create(null) // 存放所有模块的getters
    this._mutations = Object.create(null) // 存放所有模块的mutation
    this._actions = Object.create(null) // 存放所有模块的actions

    // 注册所有模块到Store实例上
    // this当前、根状态、路径、根模块
    const state = this._modules.root.state
    installModule(this, state, [], this._modules.root)
    // 实现state响应式
    resetStoreVm(this, state)
  }

  get state () {
    return this._vm._data.$$state
  }

  // 在 mutation 之前，设置 _commit = true, 调用 mutation之后更改状态
  // 如此当状态变化时，_commiting 为 true，说明是同步更改，false说明是 非mutation提交
  _withCommit (fn) {
    const commiting = this._commiting
    this._commiting = true
    fn()
    this._commiting = commiting
  }

  // 修改 commit方法，使用_withCommit 调用 mutation
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
    const entry = this._mutations[type]
    this._withCommit(() => {
      entry.forEach((fn) => {
        fn(payload)
      })
    })
  }

  dispatch (type, payload) {
    // 触发异步操作action
    if (!this.actions[type]) {
      throw new Error(`Action "${type}" not found`)
    }
    this._actions[type].forEach(fn => fn(payload))
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

function installModule (store, rootState, path, module) {
  // 获取命名空间
  const namespaced = store._modules.getNamespaced(path)

  // 收集所有模块的状态
  if (path.length > 0) { // 如果是子模块，就需要将子模块的状态定义到根模块上
    const parent = path.slice(0, -1).reduce((pre, next) => {
      return pre[next]
    }, rootState)
    // 将属性设置为响应式，可以新增属性
    // 如果对象不是响应式的话会直接赋值，如果是响应式此时新增的属性也是响应式
    Vue.set(parent, path[path.length - 1], module.state)
  }

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child)
  })

  module.forEachGetters((getters, type) => {
    // 同名计算属性会覆盖，所以不用存储
    store._wrappedGetters[namespaced + type] = () => {
      return getters(module.state)
    }
  })

  module.forEachMutations((mutations, type) => {
    // 手机所有模块的mutations 存放到 实例的 store._mutations上
    // 同名的mutations和actions 并不会覆盖，所以要有一个数组存储 {changeAge:[fn,fn,fn]}
    store._mutations[namespaced + type] = (store._mutations[namespaced + type] || [])
    store._mutations[namespaced + type].push((payload) => {
      // 函数包装  包装传参是灵活的
      // 使this 永远指向实例  当前模块状态 入参数
      mutations.call(store, module.state, payload)
    })
  })

  module.forEachActions((actions, type) => {
    store._actions[namespaced + type] = (store._actions[type] || [])
    store._actions[namespaced + type].push((payload) => {
      actions.call(store, store, payload)
    })
  })
}

function resetStoreVm (store, state) {
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  store.getters = Object.create(null)
  // 如果开启了严格模式，则调用 enableStrict
  if (store.strict) {
    enableStrictMode(store)
  }

  // 通过使用vue的computed实现缓存
  forEachValue(wrappedGetters, (fn, key) => {
    computed[key] = () => {
      return fn()
    }

    // 代理
    Object.defineProperty(store.getters, key, {
      get: () => { return store._vm[key] }
    })
  })
  // 将状态实现响应式
  store._vm = new Vue({
    data () {
      return {
        $$state: state
      }
    },
    computed
  })
}

export default {
  Store,
  install
}
