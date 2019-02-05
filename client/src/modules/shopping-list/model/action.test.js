import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

import { ENDPOINT_URL } from 'common/constants/variables';
import { fetchProducts } from './actions';
import { productsMock } from '__mocks__/productsMock';
import { ShoppingListActionTypes } from './actionTypes';
import { StatusType } from 'common/constants/enums';

const getMockStore = configureMockStore([thunk]);

describe('fetchProducts action creator', () => {
  it('dispatches the correct actions on fetch succeeded', () => {
    fetch.mockResponseOnce(JSON.stringify(productsMock));
    const store = getMockStore({ products: [] });
    const expectedActions = [
      {
        type: ShoppingListActionTypes.FETCH_PRODUCTS_REQUEST,
        products: productsMock
      }
    ];

    store.dispatch(fetchProducts()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual(`${ENDPOINT_URL}/items`);
    fetch.resetMocks();
  });

  it('dispatches the correct actions on fetch failed', () => {
    fetch.mockRejectOnce('error');
    const store = getMockStore({ fetchStatus: StatusType.PENDING });
    const expectedActions = [
      {
        type: ShoppingListActionTypes.FETCH_PRODUCTS_FAILURE,
        err: 'error'
      }
    ];
    store.dispatch(fetchProducts()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual(`${ENDPOINT_URL}/items`);
    fetch.resetMocks();
  });
});