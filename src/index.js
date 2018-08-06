//描述应用状态的数据
const appState = {
    title: {
        text: 'React.js 小书',
        color: 'red',
    },
    content: {
        text: 'React.js 小书内容',
        color: 'blue'
    }
}

//根据action的描述去操作数据的变化
function stateChanger(state, action) {
    switch (action.type) {
        case 'UPDATE_TITLE_TEXT':
          //构建共享结构的新对象返回，禁止直接修改原来的对象，一旦你要修改某些东西，你就得把修改路径上的所有对象复制一遍
          //即凡是需要对对象进行修改时都是禁止修改原对象，而是先拷贝一个新对象，在此新对象的基础上进行修改，其余对象在新旧对象中共享，指向的是同一片内存空间
          //修改数据的时候就把修改路径都复制一遍，但是保持其他内容不变，最后的所有对象具有某些不变共享的结构
          return {
              ...state,
              title: {
                  ...state.title,
                  text: action.text
              }
          }
        case 'UPDATE_TITLE_COLOR':
          return {
              ...state,
              title: {
                  ...state.title,
                  color: action.color
              }
          }
        default:
          //没有改变返回原对象
          return state
      }
}

//用一种通用的方式“监听”数据变化，然后重新渲染页面，这里用到观察者模式
function createStore(state, stateChanger) {
    //存储监听函数的数组
    const listeners = []
    const getState = () => state
    //暴露subscribe方法，调用方可通过该方法传入一个监听函数，保存在listeners数组中
    const subscribe = (listener) => listeners.push(listener)
    //被调用时除了会调用stateChanger进行数据的修改，还会遍历listeners数组里面的函数并一个个去调用。相当于我们可以通过subscribe传入数据变化的监听函数，每当dispatch的时候，监听函数就会被调用，这样我们就可以在每当数据变化时候进行重新渲染：
    const dispatch = (action) => {
        //覆盖原对象
        state = stateChanger(state, action)
        listeners.forEach((listener) => {
            listener()
        })
    }
    //生成state，dispatch，subscribe的集合
    return {
        //获取共享状态
        getState,
        //约定只能通过dispatch修改共享状态
        dispatch,
        //通过subscribe监听数据状态被修改了，并且进行后续的例如重新渲染页面的操作。
        subscribe
    }
}

/** 优化stateChange(改名为reducer)和createStore开始 */

//将state和action合并在一个函数内,reducer函数只是用来初始化数据以及描述state如何被“更改”
function reducer(state, action) {
    //如果传入state为空，则为初始化内置的数据，一般只会在一开始执行一次
    if (!state) {
        return {
            title: {
                text: 'React.js 小书',
                color: 'red',
            },
            content: {
                text: 'React.js 小书内容',
                color: 'blue'
            }
        }
    //根据action去改变state
    } else {
        switch (action.type) {
            case 'UPDATE_TITLE_TEXT':
              return {
                  ...state,
                  title: {
                      ...state.title,
                      text: action.text
                  }
              }
            case 'UPDATE_TITLE_COLOR':
              return {
                  ...state,
                  title: {
                      ...state.title,
                      color: action.color
                  }
              }
            default:
              //没有改变返回原对象
              return state
        }
    }
}

//内部的state不再通过参数传入，而是一个局部变量let state = null
//createStore接受一个叫reducer的函数作为参数，这个函数规定是一个纯函数，它接受两个参数，一个是state，一个是action。
//reducer 是不允许有副作用的。你不能在里面操作DOM，也不能发Ajax请求，更不能直接修改state，它要做的仅仅是初始化和计算新的state。
function createStore(reducer) {
    //将state设为createStore函数的临时变量，好处是使得store的state只能通过闭包getState来访问
    //即state是一个私有变量，在函数外部只能通过store提供的特定接口（getState和dispatch）来操作它，保证state的安全性
    let state = null
    const listeners = []

    const getState = () => state
    const subscribe = (listener) => listeners.push(listener)
    const dispatch = (action) => {
        //将组件的state更新
        state = reducer(state, action)
        //执行订阅函数（一般是视图渲染函数）
        listeners.forEach((listener) => {
            listener()
        })
    }
    //内部调用一次dispatch->reducer(state = null, {})，导致state被初始化完成，后续外部的dispatch就是修改数据的行为了。
    dispatch({})
    return {
        getState,
        dispatch,
        subscribe
    }
}
/** 优化stateChange(改名为reducer)和createStore结束 */

function renderApp(newAppState, oldAppState = {}) {
    // 数据没有变化就不渲染了
    if (newAppState === oldAppState) {
        return 
    }
    console.log('render app...')
    renderTitle(newAppState.title, oldAppState.title)
    renderContent(newAppState.content, oldAppState.content)
}

function renderTitle(newTitle, oldTitle = {}) {
    if (newTitle === oldTitle) {
        return
    }
    console.log('render title...')
    const titleDOM = document.getElementById('title')
    titleDOM.innerHTML = newTitle.text
    titleDOM.style.color = newTitle.color
}

function renderContent(newContent, oldContent = {}) {
    if (newContent === oldContent) {
        return 
    }
    console.log('render content...')
    const contentDOM = document.getElementById('content')
    contentDOM.innerHTML = newContent.text
    contentDOM.style.color = newContent.color
}

const store = createStore(appState, stateChanger)
//缓存旧的state
let oldState = store.getState()
store.subscribe(() => {
    //数据可能变化，获取新的state
    const newState = store.getState()
    //把新旧的state传进去渲染
    renderApp(newState, oldState)
    //渲染完以后，新的newState变成了旧的oldState，等待下一次数据变化重新渲染
    oldState = newState
})

//首次渲染页面
renderApp(store.getState())
//修改标题文本
store.dispatch({ type: 'UPDATE_TITLE_TEXT', text: '《React.js 小书!!!》' }) 
//修改标题颜色
store.dispatch({ type: 'UPDATE_TITLE_COLOR', color: 'pink' }) 
//...后面不管如何 store.dispatch，都不需要重新调用 renderApp

