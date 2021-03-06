import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom'

import { initializeFriends } from '../reducer/friendReducer';
import { initializeFriendCategories } from '../reducer/friendCategoryReducer';

const FriendListDiv = styled.div`
  bottom: 1rem;
  right: 3rem;
`

const FriendsList = () => {
  const dispatch = useDispatch();
  const friends = useSelector(state => state.friends);

  useEffect(() => {
    dispatch(initializeFriends());
  }, [dispatch]);

  return (
    <FriendListDiv>
      <h2>Friends: </h2>
      {friends.map(friend =>
        <div key={friend.id}>{friend.username}
            <Link to={`/friend/categories/${friend.id}`}>
              <button onClick={() => dispatch(initializeFriendCategories(friend.id))}>view</button>
            </Link>
        </div>)}
    </FriendListDiv>
  )
}

export default FriendsList;