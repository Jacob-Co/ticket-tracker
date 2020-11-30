import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from "styled-components";
import { Route, Switch } from 'react-router-dom';

import { setUser } from './reducer/tokenReducer'
import CategoryList from './components/CategoryList'
import HomeClock from './components/HomeClock'
import Login from './components/Login'
import Logout from './components/Logout'
import FriendsList from './components/FriendsList'
import FriendCategoriesView from './components/FriendCategoriesView'
// import serverSideEvents from './services/serverSideEvents'
// import SSEListener from './SSEListener';
import SSEListener from './components/SSEListener'

const TwoColumn = styled.div`
  display: flex;
  height: 100%;
`

const LeftColumn = styled.div`
  width: 31%;
  box-sizing: border-box;
  margin-left: 1rem;
`

const RightColumn = styled.div`
  width: 69%;
  box-sizing: border-box;
  border-left: 2px solid;
`

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.token);

  // useEffect(() => {
  //   if (user) {
  //     serverSideEvents.getStreamCode()
  //       .then(code => {
  //         let SSE = serverSideEvents.establishSSE(code, user.username);
  //         SSEListener(SSE);
  //       })
  //   }
  // }, [user]);

  useEffect(() => {
    const localUser = window.localStorage.getItem('localTicketUser');
    if (localUser) {
      const transformedUser = JSON.parse(localUser);
      dispatch(setUser(transformedUser));
    }
  }, [dispatch]);


  return (
    <>
    { user !== null
      ? <div>
          <SSEListener username={user.username} />
          <CategoryList />
        </div>
      : <Login/>
    }
    {/* { 
      user !== null
      ? <TwoColumn>
          <SSEListener username={user.username} />
          <LeftColumn>
            <Switch>
              <Route path="/">
                <CategoryList />
              </Route>
            </Switch>
          </LeftColumn>
          <RightColumn>
            <Logout />
            <FriendsList />
            <Switch>
              <Route path="/friend/categories/:id">
                <FriendCategoriesView />
              </Route>
              <Route path="/">
                <HomeClock />
              </Route>
            </Switch>
          </RightColumn>
        </TwoColumn>
      : <Login/>
    } */}
    </>
  );
}

export default App;
