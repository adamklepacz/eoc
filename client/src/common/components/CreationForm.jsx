import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Overlay, { OverlayStyleType } from 'common/components/Overlay';

class CreationForm extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultDescription, defaultName } = this.props;

    this.state = {
      description: defaultDescription || '',
      name: defaultName || ''
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.escapeListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escapeListener);
  }

  escapeListener = event => {
    const { code } = event;
    const { onHide } = this.props;
    if (code === 'Escape') {
      onHide && onHide();
    }
  };

  handleValueChange = event => {
    const {
      target: { value, nodeName }
    } = event;

    nodeName === 'TEXTAREA'
      ? this.setState({ description: value })
      : this.setState({ name: value });
  };

  handleFormSubmission = event => {
    event.preventDefault();
    const { description, name } = this.state;
    const { onSubmit } = this.props;

    onSubmit(name, description);

    this.setState({
      description: '',
      name: ''
    });
  };

  render() {
    const { defaultName, label, onHide, type } = this.props;
    const { description, name } = this.state;

    return (
      <Fragment>
        <form
          className={classNames('creation-form z-index-high', {
            'creation-form--menu': type === 'menu'
          })}
          onSubmit={this.handleFormSubmission}
        >
          <div className="creation-form__header">
            <h2 className="creation-form__heading">{label}</h2>
          </div>
          <div className="creation-form__body">
            <label className="creation-form__label">
              <input
                className="creation-form__input"
                onChange={this.handleValueChange}
                placeholder="Name"
                required={type === 'menu'}
                type="text"
                value={name}
              />
            </label>
            <label className="creation-form__label">
              <textarea
                className="creation-form__textarea"
                onChange={this.handleValueChange}
                placeholder="Description"
                type="text"
                value={description}
              />
            </label>
            <input
              className="creation-form__submit"
              type="submit"
              value={defaultName ? 'Update' : 'Create'}
            />
          </div>
        </form>
        <Overlay onClick={onHide} type={OverlayStyleType.LIGHT} />
      </Fragment>
    );
  }
}

CreationForm.propTypes = {
  defaultDescription: PropTypes.string,
  defaultName: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,

  onHide: PropTypes.func,
  onSubmit: PropTypes.func.isRequired
};

export default CreationForm;
