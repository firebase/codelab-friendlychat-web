import React from 'react';
import './Modal.css';

class Modal extends React.Component {
  
  render() {
    const { show, handleClose, children } = this.props;
    const modalCssClass = show ? 'modal display-block' : 'modal display-none';
    return (
      <aside className={modalCssClass}>
        <main className="modalMain">
          {children}
        </main>
      </aside>
    );
  }
};

export default Modal;
