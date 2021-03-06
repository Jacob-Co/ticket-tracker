import dates from '../services/dates'

export const newDate = () => {
  return async (dispatch) => {
    const {UNIX} = await dates.getDate();
    dispatch({
      type: "SET_DATE",
      data: {UNIX, original: new Date(UNIX), display: 'time'}
    })
  }
}

export const advanceUNIX = (UNIX) => {
  return {
    type: "ADVANCE",
    data: UNIX += 1000
  }
}

export const setDisplay = (display) => {
  return {
    type: 'SET_DISPLAY',
    data: display
  }
}

const dateReducer = (state = {}, action) => {
  switch (action.type) {
    case "SET_DATE":
      return action.data;
    case "SET_DISPLAY":
      return { ...state, display: action.data }
    case "ADVANCE":
      return { ...state, UNIX: action.data }
    default:
      return state
  }
}

export default dateReducer;