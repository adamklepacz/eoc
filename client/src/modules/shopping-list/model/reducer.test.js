import { ProductActionTypes } from 'modules/shopping-list/components/InputBar/model/actionTypes';
import { ShoppingListActionTypes } from './actionTypes';
import products from './reducer';
import { products as productsInitialState } from './initialState';
import { productsMock, newProductMock } from '__mocks__/productsMock';

describe('Products reducer', () => {
  let storeProducts;
  let newProduct;

  beforeEach(() => {
    storeProducts = productsMock.map(product => ({ ...product }));
    newProduct = { ...newProductMock };
  });

  it('stores products data upon fetch', () => {
    expect(
      products(productsInitialState, {
        type: ShoppingListActionTypes.FETCH_PRODUCTS_REQUEST,
        products: storeProducts
      })
    ).toEqual(storeProducts);
  });

  it('adds new product data', () => {
    expect(
      products(storeProducts, {
        type: ProductActionTypes.ADD_PRODUCT_SUCCESS,
        product: newProduct
      })
    ).toEqual([...storeProducts, newProduct]);
  });

  it('tooggles product is ordered', () => {
    expect(
      products([newProduct], {
        type: ProductActionTypes.TOGGLE_PRODUCT,
        product: [newProduct]
      })
    ).toEqual([{ ...newProduct, isOrdered: !newProduct.isOrdered }]);
  });

  it('saves voters id upon voting', () => {
    expect(
      products([newProduct], {
        type: ProductActionTypes.VOTE_FOR_PRODUCT,
        product: { id: '1234', voterIds: ['abcd', 'efgh', 'ijkl'] }
      })
    ).toEqual([{ ...newProduct, voterIds: ['abcd', 'efgh', 'ijkl'] }]);
  });

  it('removes voters id after the vote for the second time', () => {
    expect(
      products([newProduct], {
        type: ProductActionTypes.VOTE_FOR_PRODUCT,
        product: { id: '1234', voterIds: ['abcd'] }
      })
    ).toEqual([{ ...newProduct, voterIds: ['abcd'] }]);
  });
});