import React from 'react'

const Header = ({category, title}) => {
  return (
    <div className='mb-10 pl-2'>
      <p className=' text-gray-300'>
        {category}
      </p>
      <p className='text-3xl font-extrabold tracking-tight'>
        {title}
      </p>
    </div>
  )
}

export default Header