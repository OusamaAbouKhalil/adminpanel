import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, fsdb } from '../utils/firebaseconfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // Check if the user is in the 'admins' collection
      const userDocRef = doc(fsdb, 'admins', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        navigate('/restaurants');
      } else {
        alert('Access denied. You are not authorized to access this application.');
        // Optionally, sign out the user
        await auth.signOut();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container flex flex-auto justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="login-form flex self-center w-[90%] md:w-5/12">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full items-center max-w-5xl transition duration-1000 ease-out ">
          <h2 className='p-3 text-3xl font-bold text-sky-400'>Swift Bites Admins</h2>
          <div className="inline-block border-[1px] justify-center w-20 border-green-400 border-solid"></div>
          <div className='flex space-x-2 m-4 items-center justify-center'></div>
          {/* Inputs */}
          <div className='flex flex-col items-center justify-center w-[35vh]'>
            <input
              className='rounded-xl px-2 py-1 w-full border-[1px] border-green-400 m-1 focus:shadow-md focus:border-green-400 focus:outline-none focus:ring-0'
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className='rounded-xl px-2 py-1 w-full border-[1px] border-green-400 m-1 focus:shadow-md focus:border-green-400 focus:outline-none focus:ring-0'
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className='rounded-2xl m-2 text-white bg-green-400 w-2/5 px-4 py-2 shadow-md hover:text-green-400 hover:bg-white transition duration-200 ease-in'
              type="submit">
              Sign In
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
