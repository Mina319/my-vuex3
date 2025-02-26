# 手写简易版Vuex项目my-vuex3

项目描述：旨在通过手写实现一个简易版的Vuex，帮助深入理解Vuex的工作原理和内部实现机制。项目涵盖了Vuex的核心功能，包括状态管理、Getter、Mutation、Action以及模块化支持。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## 项目创建详情

### 使用vue.use 启用 vuex 插件
新建`src/vuex/index.js`

```js
let Vue = null

class Store {
    constructor(options){}
}

function install(_Vue) {
    Vue = _Vue
}

export default {
    Store,
    install
}

```

新建`src/store.index.js`文件

```js
import Vue from "vue"
import Vuex from '../vuex'

Vue.use(Vuex)

```

在`src/vuex/index.js`填充install方法

```js
function install(_Vue) {
    Vue = _Vue
    // 实现每一个组件，都能通过 this 调用 $store
    Vue.mixin({
        beforeCreate(){
            // 通过 this.$options 可以获取  new Vue({参数})传递的参数
            if (this.$options && this.$options.store) {
                // vue的原型上挂载 store （store 的实例）
                this.$store = this.$options.store
                // 等同于 Vue.prototype.$store = this.$options.store
            }
        }
    })
}
```


### Store
`src/store.index.js`中的Store类
在Vuex中，Store是一个对象，它是一个容器，用于存储和管理状态（state），包含了以下几个主要部分：
- state：存储状态的数据，也就是全局要共享的数据
- getters：包含一些函数，用于对state进行计算操作。
- mutations：包含一些函数，用于改变state的值
- actions：包含一些函数，用于处理异步操作或者一些逻辑处理

**state**
首先，我们需要定义一个存储对象，用于保存应用程序的所有状态。我们可以创建一个名为Store的类，并在其中定义一个状态对象。我们还可以将state对象定义为响应式的，以便在状态更改时通知Vue更新视图。这可以通过使用Vue.observable方法来实现。
```js
class Store {
    constructor(options){
        const { state = {}} =options
        // 使用 observable 响应化处理
        this.state = Vue.observable(state)
    }
}
```


#### getter
接下来，实现getters，以便从状态中派生计算属性。我们将getters添加到Store类中：

```js
class Store {
    constructor(options) {
        // 初始化一个空对象
        this.getters = {}
        // 遍历getters的键值对
        for (const [key, value] of Object.entries(this.getters)){
            Object.defineProperty(this.getters, key, {
                get: () => value(this.state),
              });
        };  
    }
}
```
#### commit
最后，我们需要实现mutations和actions，一遍更改状态和异步操作。mutations是唯一可以更改状态的方法，而actions则是处理异步操作的地方，它们可以触发mutations来更改状态。我们将mutations和actions添加到Store类中：

在下面的代码中，添加了一个commit方法，它接受一个类型和有效载荷参数，并调用与类型匹配的mutation函数来更改状态。

```js
class Store {
  constructor (options) {
     // 解构赋值
    const { mutations = {} } = options
    this.mutations = mutations
  }

  commit (type, payload) {
    // 检查 mutations 中是否存在该 type
    if (!this.mutations[type]) {
      throw new Error(`Mutation "${type}" not found`)
    }
    this.mutations[type](this.state, payload)
  }
}
```
#### dispatch

还需要添加了一个dispatch方法，它接受一个类型和有效载荷参数，并调用与类型匹配的action函数。注意，我们将commit和state作为参数传递给action函数，一遍在需要更改状态时使用。

```js
class Store {
  constructor (options) {
    const { actions = {} } = options;
    this.actions = actions;
  }

  dispatch (type, payload) {
    // 触发异步操作action
    if (!this.actions[type]) {
      throw new Error(`Action "${type}" not found`)
    }
    return this.actions[type]({ commit: this.commit, state: this.state }, payload)
  }
}
```
这个简单的状态管理器只是Vuex的一部分实现，但它帮助我们更好地理解了Vuex的概念和实现原理。你会发现还没有实现map辅助函数、模块化以及严格模式，后续将一步步完善，对比与vuex4、pinia的差异化等


实现了Vuex的基础功能，现在继续对其进行完善，实现模块化的状态管理。模块化可以帮助我们更好地组织和管理复杂的应用状态，使得状态的结构更加清晰和可维护。

### 格式化参数

将参数模块格式化为模块嵌套的树形结构，方便我们后续的操作。
```js
// 根模块
this.root = { // 模块的配置：包含当前模块的 state、getters、mutations、actions
    _raw: XXX,
    _children: { // 子模块
        a模块: {
            _raw: XXX,
            _children: {},
            state: xxx.state
        },
        b模块: {
            _raw: XXX,
            _children: {},
            state: xxx.state
        },
    },
    state: xxx.state
}

```
#### Module 类
新建`src/vuex/module.js`
创建Module类，通过new Module便可以得到格式化的树形数据结构。
```js
export default class Module {
    constructor(rootModule) {
        this._raw = rootModule
        this._children = {}
        this.state = rootModule.state
    }
}
```

#### ModuleCollection
新建`src/vuex/module-collection.js`
在这个类中，实现将用户传入的参数转化为格式化的结果
```js
import Module from "./module";
import forEachValue from "./utils";

export default class ModuleCollection {
    constructor(options) {
        // 注册模块： []表示路径 递归注册模块
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
```



#### forEachValue

`src/vuex/module-collection.js`需要导入`forEachValue`函数，我们新建文件`src/vuex/utils.js`，在里面定义并导出
```js
/**
 * 遍历对象的每个键值对，并对每个值执行回调函数。
 * 
 * @param {Object} obj - 需要遍历的对象，默认值为空对象。
 * @param {Function} callback - 回调函数，接收两个参数：对象的值和键。
 */
const forEachValue = (obj = {}, callback) => {
    Object.keys(obj).forEach(key => {
        // 第一个参数是值，第二个参数是键
        callback(obj[key], key)
    })
}

export default forEachValue
```

#### getChild、addChild
增加获取子模块和追加子模块方法，便于调用
```js
export default class Module {
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
```
至此，完成模块格式化为模块嵌套的树形结构，接下来重构Store，实现state、getter、commit、dispatch等











