import _filter from 'lodash/filter';
import _keyBy from 'lodash/keyBy';

import {
  CommentActionTypes,
  ItemActionTypes
} from 'modules/list/components/Items/model/actionTypes';

const comments = (state = {}, action) => {
  switch (action.type) {
    case CommentActionTypes.ADD_SUCCESS: {
      const {
        payload: { comment }
      } = action;

      return { [comment._id]: comment, ...state };
    }
    case CommentActionTypes.FETCH_SUCCESS: {
      const {
        payload: { comments }
      } = action;

      return comments;
    }
    default:
      return state;
  }
};

const items = (state = {}, action) => {
  switch (action.type) {
    case ItemActionTypes.ADD_SUCCESS:
    case ItemActionTypes.CLONE_SUCCESS: {
      const {
        payload: { item }
      } = action;

      return { [item._id]: item, ...state };
    }
    case ItemActionTypes.TOGGLE_SUCCESS: {
      const {
        payload: { authorId, authorName, itemId }
      } = action;
      const prevItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...state[itemId],
          authorId: authorId || prevItem.authorId,
          authorName: authorName || prevItem.authorName,
          isOrdered: !prevItem.isOrdered
        }
      };
    }
    case ItemActionTypes.SET_VOTE_SUCCESS: {
      const {
        payload: { itemId }
      } = action;

      const prevItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...prevItem,
          isVoted: true,
          votesCount: prevItem.votesCount + 1
        }
      };
    }
    case ItemActionTypes.CLEAR_VOTE_SUCCESS: {
      const {
        payload: { itemId }
      } = action;

      const prevItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...prevItem,
          isVoted: false,
          votesCount: prevItem.votesCount - 1
        }
      };
    }
    case ItemActionTypes.UPDATE_DETAILS_SUCCESS: {
      const {
        payload: {
          data: { description, link },
          itemId
        }
      } = action;
      const prevItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...prevItem,
          description: description || prevItem.description,
          link: link || prevItem.link
        }
      };
    }
    case ItemActionTypes.ARCHIVE_SUCCESS: {
      const {
        payload: { itemId }
      } = action;
      const prevItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...prevItem,
          isArchived: true
        }
      };
    }
    case ItemActionTypes.FETCH_ARCHIVED_SUCCESS: {
      const {
        payload: { data }
      } = action;

      return { ...state, ...data };
    }
    case ItemActionTypes.REMOVE_ARCHIVED:
      return _keyBy(_filter(state, item => !item.isArchived), '_id');
    case CommentActionTypes.ADD_SUCCESS:
    case CommentActionTypes.FETCH_SUCCESS: {
      const {
        payload: { itemId }
      } = action;
      const { comments: prevComments } = state[itemId];

      return {
        ...state,
        [itemId]: { ...state[itemId], comments: comments(prevComments, action) }
      };
    }
    default:
      return state;
  }
};

export default items;
