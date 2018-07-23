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
//其实这样写达不到性能优化的效果，因为即使修改了state.title.text，但是state还是原来那个state，这些引用指向的还是原来的对象，只是对象内的内容发生了改变。所以renderApp第一句if判断不起效果
function stateChanger(appState, action) {
    switch (action.type) {
        case 'UPDATE_TITLE_TEXT':
          appState.title.text = action.text
          break
        case 'UPDATE_TITLE_COLOR':
          appState.title.color = action.color
          break
        default:
          break
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
        stateChanger(state, action)
        listeners.forEach((listener) => {
            listener()
        })
    }
    //生产state，dispatch，subscribe的集合
    return {
        //获取共享状态
        getState,
        //约定只能通过dispatch修改共享状态
        dispatch,
        //通过subscribe监听数据状态被修改了，并且进行后续的例如重新渲染页面的操作。
        subscribe
    }
}

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

