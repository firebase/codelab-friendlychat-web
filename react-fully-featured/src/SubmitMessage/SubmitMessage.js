import React, { useContext, useEffect, useState } from 'react';
import SessionContext from '../SessionContext.js';
import useForm from '../Auth/useForm.js';
import Validation from '../validation.js';
import { removeSpecials } from '../utils.js';
import './SubmitMessage.css';

const Messages = props => {

  const submitMessage = (payload, event, clearForm) => {
    event.preventDefault();
    detectUsers(payload.message);
    const textarea = window.document.querySelector(".textarea");
    textarea.style.height = '1.5em';
    clearForm({});
  };

  const { handleSubmit, handleChange, ...formState } = useForm(submitMessage);
  const [isMessageValidated, setIsMessageValidated] = useState(false);
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [warning, setWarning] = useState(false);
  const [usersMap, setUsersMap] = useState(false);
  const sessionContext = useContext(SessionContext);
  const { activeRoom } = sessionContext.state;

  const { setWasFormSubmitted, formErrors, formValues } = formState;

  const handleKeyDown = event => {
    if (event.key === 'Enter' && event.shiftKey === false) {
      handleSubmit(event);
    }
  };

  const detectUsers = async message => {
    const usersMap = new Map(Object.entries(activeRoom.users));
    let words = await message.split(' ');
    let wordSet = await new Set();
    words = await words.filter(word => {
      word = removeSpecials(word);
      word = word.replace(/@/g,'');
      wordSet.add(word);
      return word;
    });
    const usersBuffer = {};
    await usersMap.forEach((value, key, map) => {
      if (wordSet.has(value.displayName)) {
        usersBuffer[key] = value;
      }
    });
    await sessionContext.submitMessage(message);
  };

  useEffect(() => {
    const textarea = window.document.querySelector(".textarea");
    textarea.style.height = 0;
    textarea.style.height = textarea.scrollHeight + "px";
    const _sender = {...props};
    setSender(_sender);
    return () => {
      // console.log(formValues.message);
    }
  }, [formErrors, formValues, activeRoom]);

  return (
    <div className="footerContainer">
      <form
        onSubmit={(e) => handleSubmit(e)}
        onKeyDown={(e) => handleKeyDown(e)}>
          <div className="formButtonWrapper">
            <button
              className="sendButton"
              onClick={e => {
                e.preventDefault();
              }}>
              <i className="notification material-icons">chat</i>
            </button>
            <textarea
              className="textarea"
              name="message"
              type="textarea"
              placeholder='message'
              value={formValues.message || ''}
              onChange={handleChange}
            />
            <button
              className="sendButton"
              type="submit"
              disabled={isMessageValidated}
              onClick={(e) => handleSubmit(e)}>
              <i className="send material-icons">send</i>
            </button>
          </div>
      </form>
    </div>
  );
}

export default Messages;
