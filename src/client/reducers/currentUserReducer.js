import { currentUser } from './initalState';
import { FETCH_CURRENT_USER } from '../components/Main/actions';
import { LOGOUT_USER } from '../components/UserBar/actions';

const user = (state = currentUser, action) => {
  switch (action.type) {
    case FETCH_CURRENT_USER: {
      return Object.assign({}, state, action.payload);
    }
    case LOGOUT_USER:
      return null;
    default:
      return state;
  }
};

export default user;
