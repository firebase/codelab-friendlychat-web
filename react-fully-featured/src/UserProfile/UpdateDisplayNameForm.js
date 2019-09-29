import React from 'react';
import { debounce } from '../utils.js';
import Validation from '../validation.js';

class ChangeDisplaynameForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      displaynameValue: '',
      displaynameError: '',
      isValidated: false
    }
    this.debounceDisplayname = debounce(async fieldValue => {
      try {
        this.handleFieldValue(await new Validation().displayname(fieldValue));
      } catch (error) {
        console.log(error);
      }
    }, 250);
  };

  formValidated = () => {
    const { displaynameValue, displaynameError } = this.state;
    const hasErrors = displaynameError.length ? true : false;
    const hasValues = displaynameValue.length ? true : false;
    this.setState({ isValidated: !hasErrors && hasValues });
  };

  handleFieldValue = validationResponse => {
    this.setState({
      [validationResponse[0]]: validationResponse[1]
    }, this.formValidated );
  };

  validateDisplayname = fieldValue => {
    this.setState({ displaynameValue: fieldValue }, () => {
      this.debounceDisplayname(fieldValue);
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { displaynameValue } = this.state;
    this.props.updateDisplayName(displaynameValue);
  };

  render () {
    const { displaynameError } = this.state;
    return (
      <form className="changeDisplaynameFormComponent" onSubmit={e => this.handleSubmit(e)}>
        <fieldset className="changeDisplaynameFieldset">
          <legend className="changeDisplaynameLegend">
            <p className="changeDisplaynameLegendContent">change displayname</p>
          </legend>
          <div className="changeDisplaynameParentFlex">
            <div className="changeDisplaynameFormGroup">
              <input
                className="changeDisplaynameInput"
                type="text"
                name="email"
                placeholder="e.g., mykey_42"
                onChange={e => this.validateDisplayname(e.target.value)}
              />
              <p className="changeDisplaynameErrorMessage">{displaynameError}</p>
              <button
                className="changeDisplaynameButton"
                type="submit"
                disabled={!this.state.isValidated}>
                change displayname
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    )
  }
}

export default ChangeDisplaynameForm;
