import { useState, useEffect } from 'react';
// import { validate } from './formValidation.js';
import Validation from '../validation.js';


const useForm = (callback) => {
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [wasFormSubmitted, setWasFormSubmitted] = useState(false);

  const clearForm = () => {
    setFormValues({});
    setFormErrors({});
  };

  const handleSubmit = event => {
    if (event) event.preventDefault();
    setWasFormSubmitted(true);
    callback(formValues, event, setFormValues);
   };

  const handleChange = event => {
    event.persist();
    const { name, value } = event.target;
    const error = new Validation()[name](value);
    setFormErrors(formErrors => ({ ...formErrors, ...error }));
    setFormValues(formValues => ({ ...formValues, [name]: value }));
  };

  // const debounceDisplayname = debounce(async fieldValue => {
  //   try {
  //     this.handleFieldValue(await new Validation().displayname(fieldValue));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, 250);

  return { handleChange, handleSubmit, formValues, formErrors, setFormValues };
};

export default useForm;
