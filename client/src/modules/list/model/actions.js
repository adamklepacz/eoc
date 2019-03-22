import _keyBy from 'lodash/keyBy';

import { ENDPOINT_URL } from 'common/constants/variables';
import {
  deleteData,
  getData,
  patchData,
  postData
} from 'common/utils/fetchMethods';
import { ListActionTypes } from './actionTypes';
import { MessageType as NotificationType } from 'common/constants/enums';
import { createNotificationWithTimeout } from 'modules/notification/model/actions';
import history from 'common/utils/history';

const fetchListDataFailure = errMessage => ({
  type: ListActionTypes.FETCH_DATA_FAILURE,
  payload: errMessage
});
const fetchListDataSuccess = (data, listId) => ({
  type: ListActionTypes.FETCH_DATA_SUCCESS,
  payload: { data, listId }
});

const fetchListDataRequest = () => ({
  type: ListActionTypes.FETCH_DATA_REQUEST
});

const createListSuccess = data => ({
  type: ListActionTypes.CREATE_SUCCESS,
  payload: data
});

const createListFailure = errMessage => ({
  type: ListActionTypes.CREATE_FAILURE,
  payload: errMessage
});

const createListRequest = () => ({
  type: ListActionTypes.CREATE_REQUEST
});

const deleteListSuccess = id => ({
  type: ListActionTypes.DELETE_SUCCESS,
  payload: id
});

const deleteListFailure = errMessage => ({
  type: ListActionTypes.DELETE_FAILURE,
  payload: errMessage
});

const deleteListRequest = () => ({
  type: ListActionTypes.DELETE_REQUEST
});

const updateListSuccess = data => ({
  type: ListActionTypes.UPDATE_SUCCESS,
  payload: data
});

const updateListFailure = errMessage => ({
  type: ListActionTypes.UPDATE_FAILURE,
  payload: errMessage
});

const updateListRequest = () => ({
  type: ListActionTypes.UPDATE_REQUEST
});

const fetchListsMetaDataSuccess = data => ({
  type: ListActionTypes.FETCH_META_DATA_SUCCESS,
  payload: data
});
const fetchListsMetaDataFailure = errMessage => ({
  type: ListActionTypes.FETCH_META_DATA_FAILURE,
  payload: errMessage
});
const fetchListsMetaDataRequest = () => ({
  type: ListActionTypes.FETCH_META_DATA_REQUEST
});

const fetchArchivedListsMetaDataSuccess = data => ({
  type: ListActionTypes.FETCH_ARCHIVED_META_DATA_SUCCESS,
  payload: data
});
const fetchArchivedListsMetaDataFailure = errMessage => ({
  type: ListActionTypes.FETCH_ARCHIVED_META_DATA_FAILURE,
  payload: errMessage
});
const fetchArchivedListsMetaDataRequest = () => ({
  type: ListActionTypes.FETCH_ARCHIVED_META_DATA_REQUEST
});

const archiveListSuccess = data => ({
  type: ListActionTypes.ARCHIVE_SUCCESS,
  payload: data
});
const archiveListFailure = errMessage => ({
  type: ListActionTypes.ARCHIVE_FAILURE,
  payload: errMessage
});
const archiveListRequest = () => ({
  type: ListActionTypes.ARCHIVE_REQUEST
});

const restoreListSuccess = (data, listId) => ({
  type: ListActionTypes.RESTORE_SUCCESS,
  payload: { data, listId }
});
const restoreListFailure = errMessage => ({
  type: ListActionTypes.RESTORE_FAILURE,
  payload: errMessage
});
const restoreListRequest = () => ({
  type: ListActionTypes.RESTORE_REQUEST
});

export const removeArchivedListsMetaData = () => ({
  type: ListActionTypes.REMOVE_ARCHIVED_META_DATA
});

const addToFavouritesRequest = () => ({
  type: ListActionTypes.ADD_TO_FAVOURITES_REQUEST
});

const addToFavouritesSuccess = listId => ({
  type: ListActionTypes.ADD_TO_FAVOURITES_SUCCESS,
  payload: listId
});

const addToFavouritesFailure = () => ({
  type: ListActionTypes.ADD_TO_FAVOURITES_FAILURE
});

export const fetchListData = listId => dispatch => {
  dispatch(fetchListDataRequest());
  return getData(`${ENDPOINT_URL}/lists/${listId}/data`)
    .then(resp => resp.json())
    .then(json => dispatch(fetchListDataSuccess(json, listId)))
    .catch(err => {
      dispatch(fetchListDataFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching data failed..."
      );
    });
};

export const createList = (
  name,
  description,
  adminId,
  cohortId
) => dispatch => {
  dispatch(createListRequest());
  return postData(`${ENDPOINT_URL}/lists/create`, {
    adminId,
    cohortId,
    description,
    name
  })
    .then(resp => resp.json())
    .then(json => dispatch(createListSuccess(json)))
    .catch(err => {
      dispatch(createListFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        "Oops, we're sorry, creating new list failed..."
      );
    });
};

export const fetchListsMetaData = (cohortId = null) => dispatch => {
  const url = cohortId
    ? `${ENDPOINT_URL}/lists/meta-data/${cohortId}`
    : `${ENDPOINT_URL}/lists/meta-data`;
  dispatch(fetchListsMetaDataRequest());
  return getData(url)
    .then(resp => resp.json())
    .then(json => {
      const dataMap = _keyBy(json, '_id');
      dispatch(fetchListsMetaDataSuccess(dataMap));
    })
    .catch(err => {
      dispatch(fetchListsMetaDataFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching lists failed..."
      );
    });
};

export const fetchArchivedListsMetaData = (cohortId = null) => dispatch => {
  const url = cohortId
    ? `${ENDPOINT_URL}/lists/archived/${cohortId}`
    : `${ENDPOINT_URL}/lists/archived`;
  dispatch(fetchArchivedListsMetaDataRequest());
  return getData(url)
    .then(resp => resp.json())
    .then(json => {
      const dataMap = _keyBy(json, '_id');
      dispatch(fetchArchivedListsMetaDataSuccess(dataMap));
    })
    .catch(err => {
      dispatch(fetchArchivedListsMetaDataFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching lists failed..."
      );
    });
};

export const deleteList = id => dispatch => {
  dispatch(deleteListRequest());
  return deleteData(`${ENDPOINT_URL}/lists/${id}/delete`)
    .then(resp =>
      resp.json().then(json => {
        dispatch(deleteListSuccess(id));
        createNotificationWithTimeout(
          dispatch,
          NotificationType.SUCCESS,
          json.message
        );
        history.push('/dashboard');
      })
    )
    .catch(err => {
      dispatch(deleteListFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, deleting list failed..."
      );
      throw new Error();
    });
};

export const updateList = (listId, data) => dispatch => {
  dispatch(updateListRequest());
  return patchData(`${ENDPOINT_URL}/lists/${listId}/update`, data)
    .then(resp => resp.json())
    .then(json => {
      dispatch(updateListSuccess({ ...data, listId }));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        json.message
      );
    })
    .catch(err => {
      dispatch(updateListFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, updating list failed..."
      );
    });
};

export const archiveList = listId => dispatch => {
  dispatch(archiveListRequest());
  return patchData(`${ENDPOINT_URL}/lists/${listId}/update`, {
    isArchived: true
  })
    .then(resp => resp.json())
    .then(json => {
      dispatch(archiveListSuccess({ isArchived: true, listId }));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        'List was successfully archived!' || json.message
      );
    })
    .catch(err => {
      dispatch(archiveListFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, archiving list failed..."
      );
    });
};

export const restoreList = listId => dispatch => {
  dispatch(restoreListRequest());
  return patchData(`${ENDPOINT_URL}/lists/${listId}/update`, {
    isArchived: false
  })
    .then(() => getData(`${ENDPOINT_URL}/lists/${listId}/data`))
    .then(resp => resp.json())
    .then(json => {
      dispatch(restoreListSuccess(json, listId));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        'List was successfully restored!' || json.message
      );
    })
    .catch(err => {
      dispatch(restoreListFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, restoring list failed..."
      );
    });
};

export const manageFavourites = (listId, isFavourite) => dispatch => {
  dispatch(addToFavouritesRequest());
  const path = !isFavourite
    ? `${ENDPOINT_URL}/lists/${listId}/add-to-fav`
    : `${ENDPOINT_URL}/lists/${listId}/remove-from-fav`;
  return patchData(path)
    .then(resp => {
      resp.json();
    })
    .then(json => {
      dispatch(addToFavouritesSuccess({ listId, isFavourite: !isFavourite }));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        'List is successfully marked as favourite'
      );
    })
    .catch(err => {
      dispatch(addToFavouritesFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        'Marking list as favourite failed'
      );
    });
};
