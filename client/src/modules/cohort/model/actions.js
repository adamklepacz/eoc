import _keyBy from 'lodash/keyBy';

import { ENDPOINT_URL } from 'common/constants/variables';
import { CohortActionTypes } from './actionTypes';
import {
  deleteData,
  getData,
  patchData,
  postData
} from 'common/utils/fetchMethods';
import { MessageType as NotificationType } from 'common/constants/enums';
import { createNotificationWithTimeout } from 'modules/notification/model/actions';
import history from 'common/utils/history';

const createCohortSuccess = data => ({
  type: CohortActionTypes.CREATE_SUCCESS,
  payload: data
});

const createCohortFailure = errMessage => ({
  type: CohortActionTypes.CREATE_FAILURE,
  errMessage
});

const createCohortRequest = () => ({
  type: CohortActionTypes.CREATE_REQUEST
});

const fetchCohortsMetaDataSuccess = data => ({
  type: CohortActionTypes.FETCH_META_DATA_SUCCESS,
  payload: data
});

const fetchCohortsMetaDataFailure = errMessage => ({
  type: CohortActionTypes.FETCH_META_DATA_FAILURE,
  errMessage
});

const fetchCohortsMetaDataRequest = () => ({
  type: CohortActionTypes.FETCH_META_DATA_REQUEST
});

const updateCohortRequest = () => ({
  type: CohortActionTypes.UPDATE_REQUEST
});

const updateCohortSuccess = data => ({
  type: CohortActionTypes.UPDATE_SUCCESS,
  payload: data
});

const updateCohortFailure = err => ({
  type: CohortActionTypes.UPDATE_FAILURE,
  payload: err.message
});

const archiveCohortSuccess = data => ({
  type: CohortActionTypes.ARCHIVE_SUCCESS,
  payload: data
});

const archiveCohortFailure = errMessage => ({
  type: CohortActionTypes.ARCHIVE_FAILURE,
  payload: errMessage
});

const archiveCohortRequest = () => ({
  type: CohortActionTypes.ARCHIVE_REQUEST
});

const restoreCohortSuccess = (data, cohortId) => ({
  type: CohortActionTypes.RESTORE_SUCCESS,
  payload: { data, cohortId }
});

const restoreCohortFailure = errMessage => ({
  type: CohortActionTypes.RESTORE_FAILURE,
  payload: errMessage
});

const restoreCohortRequest = () => ({
  type: CohortActionTypes.RESTORE_REQUEST
});

const deleteCohortSuccess = cohortId => ({
  type: CohortActionTypes.DELETE_SUCCESS,
  payload: cohortId
});

const deleteCohortFailure = errMessage => ({
  type: CohortActionTypes.DELETE_FAILURE,
  payload: errMessage
});

const deleteCohortRequest = () => ({
  type: CohortActionTypes.DELETE_REQUEST
});

const fetchCohortDataFailure = errMessage => ({
  type: CohortActionTypes.FETCH_DATA_FAILURE,
  payload: errMessage
});

const fetchCohortDataSuccess = (data, cohortId) => ({
  type: CohortActionTypes.FETCH_DATA_SUCCESS,
  payload: { data, cohortId }
});

const fetchCohortDataRequest = () => ({
  type: CohortActionTypes.FETCH_DATA_REQUEST
});

const fetchArchivedCohortsMetaDataSuccess = data => ({
  type: CohortActionTypes.FETCH_ARCHIVED_META_DATA_SUCCESS,
  payload: data
});
const fetchArchivedCohortsMetaDataFailure = errMessage => ({
  type: CohortActionTypes.FETCH_ARCHIVED_META_DATA_FAILURE,
  payload: errMessage
});
const fetchArchivedCohortsMetaDataRequest = () => ({
  type: CohortActionTypes.FETCH_ARCHIVED_META_DATA_REQUEST
});

export const createCohort = (name, description, adminId) => dispatch => {
  dispatch(createCohortRequest());
  return postData(`${ENDPOINT_URL}/cohorts/create`, {
    name,
    description,
    adminId
  })
    .then(resp => resp.json())
    .then(json => dispatch(createCohortSuccess(json)))
    .catch(err => {
      dispatch(createCohortFailure(err.message));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, creating new cohort failed..."
      );
    });
};

export const fetchCohortsMetaData = () => dispatch => {
  dispatch(fetchCohortsMetaDataRequest());
  return getData(`${ENDPOINT_URL}/cohorts/meta-data`)
    .then(resp => resp.json())
    .then(json => {
      const dataMap = _keyBy(json, '_id');
      dispatch(fetchCohortsMetaDataSuccess(dataMap));
    })
    .catch(err => {
      dispatch(fetchCohortsMetaDataFailure(err.message));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching cohorts meta data failed..."
      );
    });
};

export const fetchArchivedCohortsMetaData = () => dispatch => {
  dispatch(fetchArchivedCohortsMetaDataRequest());
  return getData(`${ENDPOINT_URL}/cohorts/archived`)
    .then(resp => resp.json())
    .then(json => {
      const dataMap = _keyBy(json, '_id');
      dispatch(fetchArchivedCohortsMetaDataSuccess(dataMap));
    })
    .catch(err => {
      dispatch(fetchArchivedCohortsMetaDataFailure(err.message));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching cohorts failed..."
      );
    });
};

export const updateCohort = (cohortId, data) => dispatch => {
  dispatch(updateCohortRequest());
  return patchData(`${ENDPOINT_URL}/cohorts/${cohortId}/update`, data)
    .then(resp => resp.json())
    .then(json => {
      dispatch(updateCohortSuccess({ ...data, cohortId }));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        json.message
      );
    })
    .catch(err => {
      dispatch(updateCohortFailure(err));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, updating cohort failed..."
      );
    });
};

export const deleteCohort = cohortId => dispatch => {
  dispatch(deleteCohortRequest());
  return deleteData(`${ENDPOINT_URL}/cohorts/${cohortId}/delete`)
    .then(resp => resp.json())
    .then(json => {
      dispatch(deleteCohortSuccess(cohortId));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        json.message
      );
      history.push('/dashboard');
    })
    .catch(err => {
      dispatch(deleteCohortFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, deleting cohort failed..."
      );
      throw new Error();
    });
};

export const archiveCohort = cohortId => dispatch => {
  dispatch(archiveCohortRequest());
  return patchData(`${ENDPOINT_URL}/cohorts/${cohortId}/update`, {
    isArchived: true
  })
    .then(resp => resp.json())
    .then(json => {
      dispatch(archiveCohortSuccess({ isArchived: true, cohortId }));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        'Cohort was successfully archived!' || json.message
      );
    })
    .catch(err => {
      dispatch(archiveCohortFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, archiving cohort failed..."
      );
    });
};

export const restoreCohort = cohortId => dispatch => {
  dispatch(restoreCohortRequest());
  return patchData(`${ENDPOINT_URL}/cohorts/${cohortId}/update`, {
    isArchived: false
  })
    .then(() => getData(`${ENDPOINT_URL}/cohorts/${cohortId}/data`))
    .then(resp => resp.json())
    .then(json => {
      dispatch(restoreCohortSuccess(json, cohortId));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        'Cohort was successfully restored!' || json.message
      );
    })
    .catch(err => {
      dispatch(restoreCohortFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, restoring cohort failed..."
      );
    });
};

export const fetchCohortData = cohortId => dispatch => {
  dispatch(fetchCohortDataRequest());
  return getData(`${ENDPOINT_URL}/cohorts/${cohortId}/data`)
    .then(resp => resp.json())
    .then(json => dispatch(fetchCohortDataSuccess(json, cohortId)))
    .catch(err => {
      dispatch(fetchCohortDataFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching data failed..."
      );
    });
};
