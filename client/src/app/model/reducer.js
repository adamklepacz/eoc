import { combineReducers } from 'redux';

import cohorts from 'modules/cohort/model/reducer';
import currentUser from 'modules/user/model/reducer';
import notifications from 'modules/notification/model/reducer';
import libraries from 'modules/libraries/model/reducer';
import lists from 'modules/list/model/reducer';
import activities from 'common/components/Activities/model/reducer';

const rootReducer = combineReducers({
  activities,
  cohorts,
  currentUser,
  libraries,
  lists,
  notifications
});

export default rootReducer;
