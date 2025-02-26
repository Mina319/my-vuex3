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
vue.use 是 vue 提供的安装插件 API。如果插件是一个对象，必须提供 install 方法；如果一个插件是一个函数，它被视为 install 方法。install 方法调用时，会将Vue作为参数传入。这个方法的死一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。

即需要导出 install 方法，同时导出一个类Store。

### Store
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









