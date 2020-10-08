import { createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import categoryReducer from './reducer/categoryReducer'

const reducer = combineReducers({
  categories: categoryReducer
})

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)))

export default store;