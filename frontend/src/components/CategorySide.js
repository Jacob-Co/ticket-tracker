import React, { useState } from 'react';
import styled from "styled-components";
import { Draggable } from 'react-beautiful-dnd';

import DroppableTaskList from './DroppableTaskList';
import OptionBox from './OptionBox';
import CategoryNameEditForm from './CategoryNameEditForm';

const CategoryName = styled.span`
  font-size: 1.07em;
  font-weight: bold;
  text-decoration-line: ${props => (props.isAccomplished ? 'line-through;' : 'none;')}
`

const DropDown = styled.div`
  margin-bottom: 1.5rem;
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

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  }

  return (
    <Draggable draggableId={category.id} index={arrayIndex}>
      {provided => (
        <DropDown
          ref={provided.innerRef}
          // isDragging={snapshot.isDragging}
          {...provided.draggableProps}
        >
          <div style={{"display": "flex"}}>
            <OptionBox optionsArray={[
                ['Mark Done', () => toggleAccomplishedCategory(category.id, !category.accomplished)],
                ['Edit', () => toggleEditing()],
                ['Send to', () => alert('Under Construction')],
                ['Delete', () => deleteCategory(category)]
              ]}
              checked={ category.accomplished }
            />
            { isEditing 
              ? <CategoryNameEditForm
                  category={category}
                  categoryList={categoryList}
                  toggleEditing={toggleEditing}
                />
              : <div>
                <span {...provided.dragHandleProps}>
                  <CategoryName 
                    onDoubleClick={() => makeWorkingOn(arrayIndex)}
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
                />
              </div>
            }
          </div>
        </DropDown>
      )}
    </Draggable>
  )
}

export default CategorySide;