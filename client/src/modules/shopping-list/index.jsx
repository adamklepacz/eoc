import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ProductsContainer from 'modules/shopping-list/components/ProductsContainer';
import { fetchProducts, deleteList } from 'modules/shopping-list/model/actions';
import {
  getProducts,
  getShoppingLists
} from 'modules/shopping-list/model/selectors';
import InputBar from 'modules/shopping-list/components/InputBar';
import DropdownMenu from 'common/components/DropdownMenu';
import DialogBox from 'common/components/DialogBox';
import EditIcon from 'assets/images/pen-solid.svg';
import RemoveIcon from 'assets/images/trash-alt-solid.svg';
import InviteUserIcon from 'assets/images/user-plus-solid.svg';

class ShoppingList extends Component {
  componentDidMount() {
    this.fetchProducts();
  }

  fetchProducts = () => {
    const { fetchProducts } = this.props;
    fetchProducts();
  };

  deleteListHandler = id => () => {
    const { deleteList } = this.props;
    deleteList(id);
  };

  render() {
    const {
      match: {
        params: { id: listId }
      },
      products
    } = this.props;
    const archiveList = products.filter(product => product.isOrdered);
    const shoppingList = products.filter(product => !product.isOrdered);
    const shoppingListMenu = [
      { label: 'Edit list', icon: EditIcon, callback: () => {} },
      {
        label: 'Remove list',
        icon: RemoveIcon,
        callback: this.deleteListHandler(listId)
      },
      { label: 'invite user', icon: InviteUserIcon, callback: () => {} }
    ];

    return (
      <Fragment>
        <div className="app-wrapper">
          <InputBar />
          <ProductsContainer products={shoppingList}>
            <DropdownMenu menuItems={shoppingListMenu} />
          </ProductsContainer>
          <ProductsContainer archived products={archiveList} />
        </div>
        <DialogBox message="Do You really want to delete the list?" />
      </Fragment>
    );
  }
}

ShoppingList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }).isRequired,
  products: PropTypes.arrayOf(PropTypes.object),

  deleteList: PropTypes.func,
  fetchProducts: PropTypes.func
};

const mapStateToProps = state => ({
  list: getShoppingLists(state),
  products: getProducts(state)
});

export default connect(
  mapStateToProps,
  { deleteList, fetchProducts }
)(ShoppingList);
