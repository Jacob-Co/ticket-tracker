import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { patchCategoryName } from '../reducer/categoryReducer';
import utils from './utils';

const CategoryNameEditForm = ({ category, categoryList, toggleEditing, newValueReducer }) => {
  const [ name, setName] = useState(category.name);
  const dispatch = useDispatch();
  const inputRef = useRef();
  const formRef = useRef();

  utils.useOutsideEventListener(formRef, toggleEditing);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name) {
      dispatch(newValueReducer(name));
      toggleEditing();
    }
  }

  return(
    <form onSubmit={ handleSubmit } ref={formRef}>
      <input
        ref={inputRef}
        value={name}
        onChange={({target}) => setName(target.value)}
      />
      <button>edit</button>
    </form>
  )
}

export default CategoryNameEditForm;