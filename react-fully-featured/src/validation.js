export default class Validation {

  constructor(input) {
    this.input = input ? this.washValue(input) : null;
  }

  washValue = input => {
    return input.trim();
  }

  goFetch = (uri, inputOptions) => {
    const { headers, ...extraOpts } = inputOptions || {};
    const options = {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(headers || {})
      },
      mode: "cors",
      ...extraOpts
    }
    return fetch(uri, options)
    .then(response => {
      if (!response.ok) {
        const err = new Error(response.statusText);
        err.res = response;
        throw err;
      } else {
        return response.json();
      }
    })
    .catch(err => {
      console.log('from fetch', err);
    });
  };

  checkAvailability = async fieldValue => {
    const baseUrl = process.env.REACT_APP_HTTP_URL;
    const uri = `${baseUrl}/verifyDisplayname?displayname=${fieldValue}`;
    const inputOptions = { method: "GET" };
    const response = await this.goFetch(uri, inputOptions);
    return response;
  };

  displayName = async fieldValue => {
    fieldValue = fieldValue.trim();
    let displayNameError = '';
    if (fieldValue.length === 0) {
      displayNameError = 'please choose a unique display name';
      return { displayNameError };
    } else {
      if (fieldValue.length < 2) {
        displayNameError = 'must be at least 2 characters long';
      }
      // else {
      //   const isAvailable = await this.checkAvailability(fieldValue);
      //   displayNameError = isAvailable ? '' : 'unavailable';
      // }
      return { displayNameError };
    }
  };

  email = fieldValue => {
    let emailError = /^\S+@\S+$/.test(fieldValue)
                   ? false
                   : 'must be a valid email address';
    if (!fieldValue.length) {
      emailError = 'required';
    }
    return { emailError };
  };

  password = fieldValue => {
    let passwordError = '';
    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0) {
      passwordError = 'required';
    } else {
      if (fieldValue.length < 5 || fieldValue.length > 89) {
        passwordError = 'must be 5 to 89 characters long';
      } else {
        if (!fieldValue.match(new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/))) {
          passwordError = 'must contain at least 1 number and 1 letter';
        } else {
          passwordError = '';
        }
      }
    }
    return { passwordError };
  };

  retypePassword = (fieldValuePassword, fieldValueRetypePassword) => {
    if (fieldValuePassword !== fieldValueRetypePassword) {
      return ['retypePasswordError', 'passwords do not match'];
    } else {
      return ['retypePasswordError', ''];
    }
  };

  message = input => {
    let messageError = '';
    input = input.trim();
    const codeBody = input.replace(/`/g, '').trim();
    if (input.startsWith('#')) {
      messageError = 'no markdown titles, please.';
    } else if (input.startsWith('*')) {
      messageError = 'no bullets, please.';
    } else if (input.startsWith('_``_')) {
      messageError = 'please reformat';
    } else if (!codeBody.length) {
      messageError = 'no empty code blocks, my dude';
    } else if (input === '') {
      messageError = 'need some content, yo';
    }
    return { messageError };
  }

}
