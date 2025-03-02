function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (!module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
    return module
  }
}

// const mapState = args => {
//     let states = {}
//     args.forEach(item => {
//         states[item] = function() {
//             return this.$store.state[item]
//         }
//     })
//     return states
// }

export const mapState = normalizeNamespace((namespace, states) => {
  const res = []
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      // 根模块 state、getters
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        // 通过 namespace 拿到相应的模块
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        // 子模块 state、getter
        state = module.state
        getters = module.getters
      }
      // 如：一下场景的配置项，需要执行函数，得到最终结果再返回
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
  })
  return res
})

export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}

  normalizeMap(getters).forEach(({ key, val }) => {
    val = namespace + val
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      return this.$store.getters[val]
    }
  })
  return res
})

export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      // 从store获取 commit 方法
      let commit = this.$store.commit
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        const _type = namespace + val
        commit = () => { this.$store.commit(_type) }
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}

  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        const _type = namespace + val
        dispatch = () => {
          return this.$store.dispatch(_type)
        }
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

// export default {
//     computed: mapState({
//         // 箭头函数可使代码更简练
//         count: state => state.count,

//         // 传字符串参数'count' 等同于 'state => state.count'
//         ciuntAlias: 'count',
//         // 为了能够使用 this 获取局部状态，必须使用常规函数
//         countPlusLocalState(state) {
//             return state.count + this.localCount
//         }
//     })
// }
