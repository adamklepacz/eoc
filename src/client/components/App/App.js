import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import * as itemsActions from './actions';
import Footer from '../Footer';
import Header from '../Header';
import InputBar from '../InputBar/index';
import MessageBox from '../MessageBox';
import ProductsContainer from '../ProductsContainer';
import Preloader from '../Preloader';
import UserBar from '../UserBar';
import { getFetchStatus, getItems } from '../../selectors';

class App extends Component {
  componentDidMount() {
    this.fetchItems();
  }

  fetchItems = () => {
    const {
      itemsActions: { fetchItems }
    } = this.props;

    fetchItems();
  };

  render() {
    const { fetchStatus, items } = this.props;
    const archiveList = items.filter(item => item.isOrdered).reverse();
    const shoppingList = items.filter(item => !item.isOrdered).reverse();

    return (
      <div
        className={classNames('app-wrapper', {
          overlay: fetchStatus === 'true'
        })}
      >
        <UserBar />
        <Header />
        {fetchStatus === 'error' && (
          <MessageBox
            message="Fetching failed. Try to refresh the page."
            type="error"
          />
        )}
        <InputBar />
        <ProductsContainer products={shoppingList} />
        <ProductsContainer isArchive products={archiveList} />
        <Footer />
        {fetchStatus === 'true' && <Preloader message="Fetching data..." />}
      </div>
    );
  }
}

App.propTypes = {
  fetchStatus: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object),
  itemsActions: PropTypes.objectOf(PropTypes.func)
};

const mapStateToProps = state => ({
  fetchStatus: getFetchStatus(state),
  items: getItems(state)
});

const mapDispatchToProps = dispatch => ({
  itemsActions: bindActionCreators(itemsActions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
