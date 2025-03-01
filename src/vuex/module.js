import forEachValue from './utils'

export default class Module {
  constructor (rootModule) {
    this._raw = rootModule
    this._children = {}
    this.state = rootModule.state
  }

  // 找到模块的子模块
  getChild (key) {
    // key：子模块名
    return this._children[key]
  }

  // 向模块module 追加 子模块key
  addChild (key, module) {
    this._children[key] = module
  }

  // 遍历当前模块的child
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  // 遍历当前模块的getters
  forEachGetters (fn) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, fn)
    }
  }

  // 遍历当前模块的mutations
  forEachMutations (fn) {
    if (this._raw.forEachMutations) {
      forEachValue(this._raw.mutations, fn)
    }
  }

  // 遍历当前模块的actions
  forEachActions (fn) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, fn)
    }
  }
}
