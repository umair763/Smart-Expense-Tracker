import React from 'react';
import ReactDOM from 'react-dom';
import AddExpenseForm from './AddExpenseForm';

const ExpenseFormModal = ({ onClose }) => {
   // Create a portal to render the modal at the document body level
   return ReactDOM.createPortal(<AddExpenseForm onClose={onClose} />, document.body);
};

export default ExpenseFormModal;
