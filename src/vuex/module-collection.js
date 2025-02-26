import Module from "./module";
import forEachValue from "./utils";

export default class ModuleCollection {
    constructor(options) {
        // 注册模块 []表示路径 递归注册模块
        this.register([], options)
    }

    register(path, rootModule){
        const newModule = new Module(rootModule)

        if(path.length === 0) { // 根模块
            this.root = newModule
        } else {
            const parent = path.slice(0,-1).reduce((pre, next) => {
                return pre.getChild(next)
            },this.root)
            parent.addChild(path[path.length-1], newModule)
        }

        // 注册子模块
        if(rootModule.Module){
            forEachValue(rootModule.modules, (moduleValue, moduleName) => {
                // 递归
                this.register([...path, moduleName], moduleValue)
            })
        }
    }
}