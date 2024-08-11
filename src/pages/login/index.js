import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, STORAGE_KEY } from "../../constants";
import SyncLoader from "react-spinners/SyncLoader";
import axios from "axios";

const Login = props => {
  const navigate = useNavigate();
  const [params, setParams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   getStorage()
  // }, []);

  // const getStorage = () => {
  //   const tmpUser = localStorage.getItem(STORAGE_KEY.USER);
  //   if (tmpUser) {
  //     navigate('/');
  //   }
  // }

  const onChange = e => {
    let tmpParams = {};
    if (e.target.name === 'image') {
      tmpParams[e.target.name] = e.target.files[0]
    } else {
      tmpParams[e.target.name] = e.target.value
    }
    setParams({ ...params, ...tmpParams })
  }

  const handleLogin = () => {
    try {
      setIsLoading(true);
      axios.post(`${BASE_URL}/login`, params).then((response) => {
        localStorage.setItem(STORAGE_KEY.TOKEN, response.data.data.token);
        localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(response.data.data.user));
        navigate("/");
      }).catch((error) => {
        setError(error.response.data.message)
      }).finally(() => {
        setIsLoading(false)
      });
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="container mx-auto flex h-screen justify-center items-center">
      <div className="flex shadow-2xl px-5 py-10 flex-col rounded-lg gap-6">
        <h1 className="text-indigo-500 font-bold text-2xl">Login</h1>
        {error !== '' && (
          <div className="bg-red-600 px-2 py-1 rounded">
            <p className="text-white">{error}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label for="email">Email</label>
            <input onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="email" name="email" />
          </div>
          <div className="flex flex-col gap-1">
            <label for="password">Password</label>
            <input onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="password" id="password" name="password" />
          </div>
        </div>
        <button
          disabled={isLoading}
          className="bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded p-2 font-bold items-center justify-center"
          onClick={handleLogin}
        >
          {isLoading ? (
            <SyncLoader
              color={'#fff'}
              loading={isLoading}
              size={5}
              margin={2}
              speedMultiplier={0.8}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : (
            'Login'
          )}
        </button>
        <p>Don’t have an account? <a href="/signup"><span className="text-indigo-500 font-bold">Sign Up</span></a></p>
      </div>
    </div>
  )
}

export default Login
