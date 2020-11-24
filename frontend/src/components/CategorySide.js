import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom'

import DroppableTaskList from './DroppableTaskList';
import OptionBox from './OptionBox';
import UniversalEditForm from './UniversalEditForm';
import SendForm from './SendForm';
import TaskForm from './TaskForm';
// reducers
import { patchSentTo } from '../reducer/categoryReducer';
import { patchCategoryName } from '../reducer/categoryReducer';

const CategoryName = styled.span`
  font-size: 1.07em;
  font-weight: bold;
  text-decoration-line: ${props => (props.isAccomplished ? 'line-through;' : 'none;')}
`

const DropDown = styled.div`
  margin-bottom: 1.5rem;
`

const ContentDiv = styled.div`
  margin-left: 1.5rem;
`

const SendFormWrapper = styled.div`
  margin-left: 3rem;
`

const SendToDiv = styled.div`
  margin-left: 1rem;
  font-size: 1.02em;
  font-style: italic;
`

const CategorySide = ({
      category,
      deleteCategory,
      makeWorkingOn,
      arrayIndex,
      makeTaskWorkingOn,
      toggleAccomplishedCategory,
      categoryList,
    }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const taskListRef = useRef();
  const taskFormRef = useRef();
  const dispatch = useDispatch();
  const username = useSelector(state => state.token.username);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  }

  const toggleSending = () => {
    setIsSending(!isSending);
  }

  const optionsToBePassed = (isAccomplished, isSent, isNotOwned) => {
    const toggleDone = ['Toggle Done', () => {
      for (const task of category.tasks) {
        if (!task.accomplished) return alert('Cannot toggle done, not all tasks are accomplished');
      }
      toggleAccomplishedCategory(category.id, !category.accomplished)
    }];
    const edit = ['Edit', () => toggleEditing()];
    const sendTo = ['Send to', () => toggleSending()];
    const deleteFunction = ['Delete', () => deleteCategory(category)];
    const unsend = ['Unsend', () => dispatch(patchSentTo(category.id, null))];
    const showTaskForm = ['New Task', () => taskFormRef.current.displayTaskForm()];

    if (isNotOwned) {
      return[toggleDone]
    } else if (isAccomplished && isSent) {
      return [unsend, deleteFunction]
    } else if (isAccomplished) {
      return [toggleDone, deleteFunction]
    } else if (isSent) {
      return [unsend]
    }

    return [toggleDone, edit, showTaskForm, sendTo, deleteFunction];
  }

  const showTasks = () => {
    taskListRef.current.displayTasks();
  }
  
  const newCategoryNameReducer = (newName) => {
    return patchCategoryName(category.id, categoryList, newName);
  }

  return (
    <Draggable draggableId={category.id} index={arrayIndex}>
      {provided => (
        <DropDown
          ref={provided.innerRef}
          // isDragging={snapshot.isDragging}
          {...provided.draggableProps}
        >
          <ContentDiv style={{"display": "flex"}}>
            <OptionBox optionsArray={optionsToBePassed(category.accomplished,
                category.sentTo,
                (category.sentTo && category.sentTo.username === username)
              )}
              checked={ category.accomplished }
            />
            { isEditing 
              ? <UniversalEditForm
                  orignalValue={category.name}
                  toggleEditing={toggleEditing}
                  newValueReducer={newCategoryNameReducer}
                />
              : <div>
                <span {...provided.dragHandleProps}>
                  <CategoryName 
                    onDoubleClick={() => {
                      (category.sentTo && category.sentTo.username !== username)
                        ? alert('Cannot work on items you sent to others!')
                        : makeWorkingOn(arrayIndex)
                    }}
                    isAccomplished={category.accomplished}
                  >
                    {category.name}
                  </CategoryName>
                </span>
                <DroppableTaskList 
                  category={category}
                  deleteCategory={deleteCategory}
                  makeTaskWorkingOn={makeTaskWorkingOn}
                  categoryArrayIndex={arrayIndex}
                  ref={taskListRef}
                >
                  {category.sentTo
                    ? <SendToDiv>{category.sentTo.username === username 
                        ? <Link to={`/friend/categories/${category.user.id}`}>
                            {`from: ${category.user.username}`}
                          </Link>
                        : <Link to={`/friend/categories/${category.sentTo.id}`}>
                            {`sent to: ${category.sentTo.username}`}
                          </Link>
                      }</SendToDiv> 
                    : ""}
                  <TaskForm 
                    ref={taskFormRef}
                    category={category}
                    showTasks={showTasks}
                    />
                </DroppableTaskList>
              </div>
            }
          </ContentDiv>
          {isSending
            ? <SendFormWrapper>
                <SendForm 
                  toggleSending={toggleSending}
                  item={category}
                />
              </SendFormWrapper>
            : ''
          }
        </DropDown>
      )}
    </Draggable>
  )
}

export default CategorySide;