import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Preloader, {
  PreloaderSize,
  PreloaderTheme
} from 'common/components/Preloader';

class MembersForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      inputValue: '',
      isFocused: false
    };

    this.input = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleEnterPress);
    this.input.current.focus();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEnterPress);
  }

  handleInputChange = event => {
    const {
      target: { value }
    } = event;
    this.setState({ inputValue: value });
  };

  handleEnterPress = event => {
    const { code } = event;
    const { isFocused } = this.state;

    if (code === 'Enter' && isFocused) {
      this.handleAddNew();
    }
  };

  handleAddNew = () => {
    const { onAddNew } = this.props;
    const { inputValue } = this.state;

    onAddNew(inputValue);
  };

  handleSubmit = event => event.preventDefault();

  handleFocus = () => this.setState({ isFocused: true });

  handleBlur = () => this.setState({ isFocused: false });

  render() {
    const { inputValue } = this.state;
    const { pending } = this.props;

    return (
      <form className="members-form" onSubmit={this.handleSubmit}>
        <input
          className="members-form__input primary-input"
          disabled={pending}
          onBlur={this.handleBlur}
          onChange={this.handleInputChange}
          onFocus={this.handleFocus}
          placeholder="Enter email"
          ref={this.input}
          type="email"
          value={inputValue}
        />
        <button
          className="primary-button"
          disabled={pending}
          onClick={this.handleAddNew}
          type="button"
        >
          Add
          {pending && (
            <Preloader
              size={PreloaderSize.SMALL}
              theme={PreloaderTheme.LIGHT}
            />
          )}
        </button>
      </form>
    );
  }
}

MembersForm.propTypes = {
  pending: PropTypes.bool.isRequired,

  onAddNew: PropTypes.func.isRequired
};

export default MembersForm;
