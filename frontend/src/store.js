import { createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import categoryReducer from './reducer/categoryReducer'
import dateReducer from './reducer/dateReducer'
import tokenReducer from './reducer/tokenReducer'
import friendReducer from './reducer/friendReducer'
import friendCategoryReducer from './reducer/friendCategoryReducer';
import sentToItemReducer from './reducer/sentToItemReducer';
import sseReducer from './reducer/sseReducer';


const reducer = combineReducers({
  categories: categoryReducer,
  date: dateReducer,
  token: tokenReducer,
  friends: friendReducer,
  friendCategories: friendCategoryReducer,
  sentToItems: sentToItemReducer,
  sse: sseReducer 
})

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)))

export default store;