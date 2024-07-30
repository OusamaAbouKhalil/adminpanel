import React from 'react'
import { useNavigate } from 'react-router-dom';

const Button = ({ bgColor, color, size, text, borderRadius,action }) => {
  const navigate = useNavigate();
  const add = () => {
    navigate('/add');
  };
  return (
    <button
      type='button'
      style={{ backgroundColor: bgColor, color, borderRadius }}
      className={`text-${size} p-3 hover:drop-shadow-xl mb-3`}
      onClick={action === "add"?add:null} //
    >
      {text}
    </button>
  )
}

export default Button