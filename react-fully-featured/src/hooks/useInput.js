// import React, { useState, useEffect } from 'react';
// import { debounce } from '../utils.js';
// import Validation from '../validation.js';
//
// const useInput = input => {
//
//   const [formState, setFormState] = useState({
//     displayNameValue: null,
//     emailValue: null,
//     passwordValue: null,
//     displayNameError: null,
//     emailError: null,
//     passwordError: null
//   });
//
//   handleChange = event => {
//     event.persist();
//     const { name, value } = event.target;
//     const
//     setValues(value => ({ ...formState, [name]: value }));
//   };
//
//   const debounceDisplayname = debounce(async fieldValue => {
//     try {
//       this.handleFieldValue(await new Validation().displayname(fieldValue));
//     } catch (error) {
//       console.log(error);
//     }
//   }, 250);
//
//   return { displayNameError, emailError, passwordError };
// };
//
// const formValidated = () => {
//
//   const hasErrors = displayNameError.length || emailError.length
//                   || passwordError.length
//                   ? true : false;
//   const hasValues = displaynameValue.length && emailValue.length
//                   && passwordValue.length
//                   ? true : false;
//   this.setState({ formValidated: !hasErrors && hasValues });
// };
//
// handleFieldValue = validationResponse => {
//   this.setState({
//     [validationResponse[0]]: validationResponse[1]
//   }, this.formValidated );
// };
//
// validateDisplayname = fieldValue => {
//   this.setState({ displaynameValue: fieldValue }, () => {
//     this.debounceDisplayname(fieldValue);
//   });
// };
//
// validateEmail = fieldValue => {
//   this.setState({ emailValue: fieldValue }, () => {
//     this.handleFieldValue(new Validation().email(fieldValue));
//   });
// };
//
// validatePassword = fieldValue => {
//   this.setState({ passwordValue: fieldValue }, () => {
//     this.handleFieldValue(new Validation().password(fieldValue));
//   });
// };
//
// handleSubmit = event => {
//   event.preventDefault();
//   const { displayNameValue, emailValue, passwordValue } = this.state;
//   this.props.verifyCredentials(displayNameValue, emailValue, passwordValue);
// };
//
