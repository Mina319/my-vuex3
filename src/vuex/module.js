export default class Module {
    constructor(rootModule) {
        this._raw = rootModule
        this._children = {}
        this.state = rootModule.state
    }

    // 找到模块的子模块
    getChild(key){
        // key：子模块名
        return this._children[key]
    }

    // 向模块module 追加 子模块key
    addChild(key, module) {
        this._children[key] = module
    }
}