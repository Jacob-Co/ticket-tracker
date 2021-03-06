import categories from '../services/categories'
import tasks from '../services/tasks'

export const initializeCategories = () => {
  return async (dispatch) => {
    const allCategories = await categories.getAll()
    dispatch({
      type: 'INIT_CATEGORIES',
      data: allCategories
    })
  }
}

export const createNewCategory = (category) => {
  return async (dispatch) => {
    const newCategory = await categories.postNewCategory(category)
    dispatch({
      type: 'NEW_CATEGORY',
      data: newCategory
    })
  }
}

export const removeCategory = (id, categoryList) => {
  return async (dispatch) => {
    let updatedCategoryList = [];
    let categoriesToBeUpdated = [];
    let counter = 0;

    categoryList.forEach(category => {
      if (category.id === id) return;
      if (category.index !== counter) {
        category.index = counter;
        categoriesToBeUpdated = categoriesToBeUpdated.concat(category);
      }
      updatedCategoryList = updatedCategoryList.concat(category);
      counter += 1;
    });

    dispatch({
      type: 'UPDATE_CATEGORY_LIST',
      data: updatedCategoryList
    });

    await categories.deleteCategory(id);
    for (const category of categoriesToBeUpdated) {
      await categories.patchIndex(category.id, category.index);
    }
  }
}

export const createNewTask = (task) => {
  return async(dispatch) => {
    const newTask = await tasks.createTask(task);
    dispatch({
      type: 'NEW_TASK',
      data: {
        task: newTask,
      }
    })
  }
}

export const removeTask = (taskId, category) => {
  return async (dispatch) => {
    const updatedCategory = category;
    updatedCategory.tasks = category.tasks.filter(task => task.id !== taskId);

    dispatch({
      type: 'UPDATE_CATEGORY',
      data: updatedCategory
    })

    await tasks.deleteTask(taskId);
  }
}

// SWITCH

const quickSwitchTasks = (sourceIdx, destinationIdx, taskList) => {
  let newTaskList = taskList.slice();
  newTaskList.splice(sourceIdx, 1);
  newTaskList.splice(destinationIdx, 0, taskList[sourceIdx]);
  return newTaskList;
}

export const switchTaskIndexes = (sourceIdx, destinationIdx, categoryList, categoryId) => {
  return async (dispatch) => {
    let quickUpdatedTasks;
    let previousTasks;
    const quickUpdatedCategoryList = categoryList.map(category => {
      if (category.id === categoryId) {
        previousTasks = category.tasks;
        category.tasks = quickSwitchTasks(sourceIdx, destinationIdx, category.tasks);
        quickUpdatedTasks = category.tasks
      };
      return category
    })

    dispatch({
      type: 'UPDATE_CATEGORY_LIST',
      data: quickUpdatedCategoryList
    })

    for (const category of quickUpdatedCategoryList) {
      if (category.id === categoryId) {
        let counter = 0;
        for (let task of quickUpdatedTasks) {
          if (task.id !== previousTasks[counter].id) {
            task = await tasks.updateIndex(task.id, counter);
          }
          counter += 1;
        }
      };
    };
  }
}

export const updateCategoryWorkingOn = (category, myUsername, { isWorkingOn }) => {
  const isCategoryMine = category.sentTo &&
    category.sentTo.username !== myUsername
  if (isCategoryMine) {
    category.workingOn = isWorkingOn;
  } else {
    category.sentToWorkingOn = isWorkingOn;
  }
  if (!isWorkingOn) category.taskWorkingOn = null;

  return category;
}

const quickSwitchCategories = (sourceIdx, destinationIdx, categoryList, myUsername) => {
  let newCategoryList = categoryList.slice();
  const workingOnIdx = 0;

  let sourceCategory = newCategoryList.splice(sourceIdx, 1)[0];
  let destinationCategory = categoryList[destinationIdx];

  const isDestinationCategoryPlaceHolder = !!destinationCategory.extraInfo;

  if (destinationIdx === workingOnIdx) {
    sourceCategory = updateCategoryWorkingOn(sourceCategory, myUsername, { isWorkingOn: true });
    if (!isDestinationCategoryPlaceHolder) {
      destinationCategory = updateCategoryWorkingOn(destinationCategory, myUsername, { isWorkingOn: false });
    }
  }
  
  if (isDestinationCategoryPlaceHolder) {
    newCategoryList.splice(destinationIdx, 1, sourceCategory);
  } else {
    newCategoryList.splice(destinationIdx, 0, sourceCategory);
  }

  if (sourceIdx === workingOnIdx) {
    const placeHolderCategory = {
      id: 'placeHolder',
      name: '--Double click a Project or a Task to place here--',
      index: 0,
      workingOn: false,
      extraInfo: 'placeHolder'
    };
    newCategoryList.splice(0, 0, placeHolderCategory);
    sourceCategory = updateCategoryWorkingOn(sourceCategory, myUsername, { isWorkingOn: false });
  }

  console.log(newCategoryList)
  return newCategoryList;
}

const updateCategoryIndexOnDb = async (categoriesToBeUpdated, username) => {
  let counter = 0;

  for (const category of categoriesToBeUpdated) {
    const isSentToMe = category.sentTo && (category.sentTo.username === username);
    if (category.extraInfo) {
      counter += 1;
      continue;
    }

    if (isSentToMe) {
      await categories.patchSentToIndex(category.id, counter);
    } else {
      await categories.patchIndex(category.id, counter);
    }

    if (counter === 0) {
      await categories.patchWorkingOn(category.id, isSentToMe, true);
      counter += 1;
      continue;
    } 

    await categories.patchWorkingOn(category.id, isSentToMe, false);
    await categories.patchTaskWorkingOn(category.id, null);

    counter += 1;
  }
};

export const switchCategoryIndexes = (sourceIdx, destinationIdx, categoryList, username) => {
  return async(dispatch) => {
    const quickUpdatedCategoryList = quickSwitchCategories(sourceIdx, destinationIdx, categoryList, username);
    dispatch({
      type: 'UPDATE_CATEGORY_LIST',
      data: quickUpdatedCategoryList
    })

    await updateCategoryIndexOnDb(quickUpdatedCategoryList, username);
  }
}

export const switchTaskWorkingOn = (paramCategory, task, categoryList, categoryArrayPosition, username) => {
  return async (dispatch) => {
    paramCategory.taskWorkingOn = task;
    const updatedCategoryList = categoryList.map(category => {
      if (category.id === paramCategory.id) {
        return paramCategory;
      }
      return category
    });
    const quickUpdatedCategoryList = quickSwitchCategories(categoryArrayPosition, 0, updatedCategoryList, username);
    dispatch({
      type: 'UPDATE_CATEGORY_LIST',
      data: quickUpdatedCategoryList
    });
    await categories.patchTaskWorkingOn(paramCategory.id, task.id);
    await updateCategoryIndexOnDb(quickUpdatedCategoryList, username);
  }
}

// CATEGORY PATCH

export const patchAccomplishedCategory = (categoryId, categoryList, accomplishedStatus) => {
  return async (dispatch) => {
    const updatedCategoryList = categoryList.map(category => {
      if (category.id === categoryId) {
        category.accomplished = accomplishedStatus
      }
      return category;
    });

    dispatch({
      type: 'UPDATE_CATEGORY_LIST',
      data: updatedCategoryList
    });

    await categories.patchAccomplishedCategory(categoryId, accomplishedStatus);
  };
}

export const patchCategoryName = (categoryId, categoryList, newName) => {
  return async (dispatch) => {
    const updatedCategoryList = categoryList.map(category => {
      if (category.id === categoryId) {
        category.name = newName;
      }
      return category;
    });

    dispatch({
      type: 'UPDATE_CATEGORY_LIST',
      data: updatedCategoryList
    })

    await categories.patchCategoryName(categoryId, newName);
  }
}

export const patchSentTo = (categoryId, sentTo) => {
  return async (dispatch) => {
    const updatedCategory = await categories.patchSentTo(categoryId, sentTo);

    dispatch({
      type: 'UPDATE_CATEGORY',
      data: updatedCategory
    })
  }
}

const categoryReducer = (state = [], action) => {
  switch (action.type) {
    case 'INIT_CATEGORIES':
      return action.data
    case 'NEW_CATEGORY':
      return state.concat(action.data)
    case 'REMOVE_CATEGORY':
      return state.filter(category => category.id !== action.data.id);
    case 'NEW_TASK':
      return state.map(category => {
        if (category.id === action.data.task.category) {
          category.tasks = category.tasks.concat(action.data.task);
        }
        return category;
      });
    case 'UPDATE_CATEGORY':
      return state.map(category => {
        if (category.id === action.data.id) {
          return action.data;
        }
        return category;
      });
    case 'UPDATE_CATEGORY_LIST':
      return action.data;
    case 'UPDATE_TASK':
      const updatedTask = action.data;
      const targetCategoryId = updatedTask.category.toString();
      state = state.map(category => {
        if (category.id === targetCategoryId) {
          category.tasks = category.tasks.map(task => {
            if (task.id === updatedTask.id) return updatedTask;
            return task;
          })
        }
        return category;
      })
      return state;
    default:
      return state
  }
}

// TASK PATCH

const genericTaskPatch = (taskServiceFunction ,taskId, newValue) => {
  return async (dispatch) => {
    const returnTask = await taskServiceFunction(taskId, newValue);
    dispatch({
      type: 'UPDATE_TASK',
      data: returnTask
    })
  }
}

export const patchTaskAccomplished = (taskId, accomplished) => {
  return genericTaskPatch(tasks.updateAccomplished, taskId, accomplished);
}

export const patchTaskName = (taskId, name) => {
  return genericTaskPatch(tasks.updateName, taskId, name);
}

export const patchTaskSentTo = (taskId, receiverId) => {
  return genericTaskPatch(tasks.updateSentTo, taskId, receiverId);
}

export default categoryReducer
