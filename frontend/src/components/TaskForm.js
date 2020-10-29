import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { createNewTask } from '../reducer/categoryReducer'

const TaskForm = ({category}) => {
  const dispatch = useDispatch();

  const [name, setName] = useState('')
  const [content, setContent] = useState('')

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (name) {
      dispatch(createNewTask({name, content, category: category.id}));
      setName('');
      setContent('');
    }
  }

  return(
    <div>
      <h3>Creating a new task</h3>
      <form onSubmit={handleFormSubmit}>
        <div>
          name
          <input
            type="text"
            id="name"
            name="Name"
            value={name}
            onChange={({target}) => setName(target.value)}
          />
        </div>

        {/* <div>
          content
          <input
            type="text"
            id="content"
            name="Content"
            value={content}
            onChange={({target}) => setContent(target.value)}
          />
        </div> */}
        <button>create</button>
      </form>
    </div>
  )
}

export default TaskForm