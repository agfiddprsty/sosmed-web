import React, { useEffect, useState } from "react";
import axios from "axios";
import SyncLoader from "react-spinners/SyncLoader";
import { useNavigate } from "react-router-dom";
import { BASE_URL, STORAGE_KEY } from "../../constants";

const Signup = props => {
  // console
  const navigate = useNavigate();
  const [params, setParams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getStorage()
  }, [])

  const getStorage = () => {
    const tmpUser = localStorage.getItem(STORAGE_KEY.USER);
    if (tmpUser) {
      navigate('/');
    }
  }

  const onChange = e => {
    let tmpParams = {};
    if (e.target.name === 'image') {
      tmpParams[e.target.name] = e.target.files[0]
    } else {
      tmpParams[e.target.name] = e.target.value
    }
    setParams({ ...params, ...tmpParams })
  }

  const handleSignUp = () => {
    try {
      setIsLoading(true)
      const formData = new FormData();
      if (params.image) {
        formData.append('image', params.image)
      }
      if (params.bio) {
        formData.append('bio', params.bio)
      }
      if (params.interests) {
        formData.append('interests', params.interests)
      }
      formData.append('name', params.name)
      formData.append('email', params.email)
      formData.append('password', params.password)
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Accept: 'application/json'
        }
      }
      axios.post(`${BASE_URL}/register`, formData, config).then((response) => {
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex h-screen justify-center items-center">
      <div className="flex shadow-2xl px-5 py-10 flex-col rounded-lg gap-6 w-4/12">
        <h1 className="text-indigo-500 font-bold text-2xl">Sign Up</h1>
        {error !== '' && (
          <div className="bg-red-600 px-2 py-1 rounded">
            <p className="text-white">{error}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label for="name">Name<span className="text-red-600">*</span></label>
            <input onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="name" name="name" />
          </div>
          <div className="flex flex-col gap-1">
            <label for="email">Email<span className="text-red-600">*</span></label>
            <input onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="email" name="email" />
          </div>
          <div className="flex flex-col gap-1">
            <label for="password">Password<span className="text-red-600">*</span></label>
            <input onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="password" id="password" name="password" />
          </div>
          <div className="flex flex-col gap-1">
            <label for="bio">Bio</label>
            <textarea onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" id="bio" name="bio" />
          </div>
          <div className="flex flex-col gap-1">
            <label for="interests">Interest</label>
            <input onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="interests" name="interests" />
          </div>
          <div className="flex flex-col gap-1">
            <label for="image">Profile Picture</label>
            <input onChange={e => onChange(e)} type="file" id="image" name="image" />
          </div>
        </div>
        <button
          disabled={isLoading}
          className="bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded p-2 font-bold items-center justify-center"
          onClick={handleSignUp}
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
            'Sign Up'
          )}
        </button>
      </div>
    </div>
  )
}

export default Signup
