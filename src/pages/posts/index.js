import axios from "axios";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { SyncLoader } from "react-spinners";
import { BASE_URL, STORAGE_KEY } from "../../constants";
import { useNavigate } from "react-router-dom";

const Posts = props => {
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [params, setParams] = useState({})
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState('');
  const [image, setImage] = useState();
  const [edit, setEdit] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    getStorage();
    getPosts()
  }, []);

  const getStorage = () => {
    const tmpUser = localStorage.getItem(STORAGE_KEY.USER);
    const tmpToken = localStorage.getItem(STORAGE_KEY.TOKEN);
    setToken(tmpToken)
    if (tmpUser) {
      setUser(JSON.parse(tmpUser));
    }
  }

  const getPosts = () => {
    try {
      const config = {
        headers: {
          Accept: 'application/json'
        }
      }
      axios.get(`${BASE_URL}/posts`, config).then((response) => {
        let tmpPost = [];
        for (let i = 0; i < response.data.data.length; i++) {
          tmpPost.push({ ...response.data.data[i], isEdit: false })
        }
        setPosts(tmpPost)
        inputRefs.current = inputRefs.current.slice(0, response.data.data.length);
      }).catch((error) => {
        setError(error.response.data.message)
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePost = () => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }
      formData.append('content', post);
      axios.post(`${BASE_URL}/posts/create`, formData, config).then((response) => {
        setImage();
        setPost('')
        getPosts();
      }).catch((error) => {
        setError(error.response.data.message);
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleDeletePost = id => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
      axios.delete(`${BASE_URL}/posts/${id}`, config).then((response) => {
        getPosts();
      }).catch((error) => {
        setError(error.response.data.message);
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleComment = props => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
      axios.post(`${BASE_URL}/comments`, { post_id: props.id, content: comment }, config).then(() => {
        setComment('')
        getPosts();
      }).catch((error) => {
        setError(error.response.data.message);
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleLike = id => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
      axios.post(`${BASE_URL}/posts/${id}/like`, {}, config).then(() => {
        getPosts();
      }).catch((error) => {
        setError(error.response.data.message);
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleEditPost = id => {
    try {
      setIsLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
      axios.put(`${BASE_URL}/posts/${id}`, { content: edit }, config).then(() => {
        getPosts();
      }).catch((error) => {
        setError(error.response.data.message);
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveProfile = () => {
    try {
      setIsLoading(true);
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
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
      axios.post(`${BASE_URL}/user/${user?.id}/update`, formData, config).then((response) => {
        console.log(response)
        localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(response.data.data.user));
        getPosts();
        setIsOpen(false);
        getStorage()
      }).catch((error) => {
        setError(error.response.data.message);
      }).finally(() => {
        setIsLoading(false)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.reload()
  }

  const onChangePost = e => {
    setPost(e.target.value)
  }

  const onChangeComment = e => {
    setComment(e.target.value)
  }

  const onChangeEditPost = value => {
    setEdit(value)
  }

  const onPressEdit = (index) => {
    let tmpPosts = posts;
    tmpPosts[index].isEdit = true;
    setEdit(tmpPosts[index].content)
    setPosts(tmpPosts);
  }

  const onChangeImage = e => {
    setImage(e.target.files[0])
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

  return (
    <div className="container mx-auto flex my-5 flex-row gap-5">
      <div className="flex-1">
        <div className="fixed shadow-xl px-5 py-10 flex-col rounded-lg gap-6 h-90vh w-2/12">
          {user ? (
            <div className="flex flex-col justify-between h-full items-center">
              <div className="flex flex-col items-center gap-3">
                {user?.image ? (
                  <img width={150} src={user?.image} alt="Profile Picture" />
                ) : (
                  <div className="flex w-auto items-center">
                    <div className="bg-gray-300 p-2.5 rounded-full">
                      <svg width="34" height="36" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.9402 17.5687C12.741 17.5687 9.12769 13.8187 9.12769 8.97493C9.12769 4.18977 12.7605 0.53743 16.9402 0.53743C21.1199 0.53743 24.7527 4.11165 24.7527 8.93587C24.7527 13.8187 21.1199 17.5687 16.9402 17.5687ZM3.83472 35.6546C1.74487 35.6546 0.494873 34.6781 0.494873 33.057C0.494873 28.0179 6.80347 21.0648 16.9207 21.0648C27.0574 21.0648 33.366 28.0179 33.366 33.057C33.366 34.6781 32.116 35.6546 30.0261 35.6546H3.83472Z" fill="black" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <p className="font-bold">{user?.name}</p>
                  <p>{user?.bio}</p>
                  <p>{user?.interests}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button className="w-full bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/50 text-indigo-500 rounded p-2 font-bold items-center justify-center" onClick={() => setIsOpen(true)}>
                  Edit Profile
                </button>
                <button className="w-full bg-white border-2 border-red-500 shadow-lg shadow-red-500/50 text-red-500 rounded p-2 font-bold items-center justify-center" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <button className="bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/50 text-indigo-500 rounded p-2 font-bold items-center justify-center" onClick={handleSignUp}>
                Sign Up
              </button>
              <button className="bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded p-2 font-bold items-center justify-center" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-3 w-32 flex gap-10 flex-col">
        {user && (
          <div className="flex flex-col gap-2 bg-white p-5 shadow-lg rounded">
            <textarea className="border w-full p-2 rounded" value={post} onChange={e => onChangePost(e)} placeholder="Create post" />
            <div className="flex flex-col gap-1">
              <input onChange={e => onChangeImage(e)} type="file" id="postImage" name="postImage" />
            </div>
            <div className="flex justify-end">
              <button
                className="w-auto bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded py-2 px-5 font-bold items-center justify-center"
                onClick={handlePost}
              >
                Post
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5">
          {posts.length > 0 ? posts.map((post, index) => (
            <div className="flex flex-col gap-4 bg-white p-5 shadow-lg rounded" key={index}>
              <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                  {post.user?.image ? (
                    <img width={50} src={post.user?.image} alt="Profile Picture" />
                  ) : (
                    <div className="flex w-auto items-center">
                      <div className="bg-gray-300 p-2.5 rounded-full">
                        <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.71289 8.68555C6.61328 8.68555 4.80664 6.81055 4.80664 4.38867C4.80664 1.99609 6.62305 0.169922 8.71289 0.169922C10.8027 0.169922 12.6191 1.95703 12.6191 4.36914C12.6191 6.81055 10.8027 8.68555 8.71289 8.68555ZM2.16016 17.7285C1.11523 17.7285 0.490234 17.2402 0.490234 16.4297C0.490234 13.9102 3.64453 10.4336 8.70312 10.4336C13.7715 10.4336 16.9258 13.9102 16.9258 16.4297C16.9258 17.2402 16.3008 17.7285 15.2559 17.7285H2.16016Z" fill="black" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="font-bold">{post.user.name}</p>
                    <p className="text-sm">{moment(post.created_at).local().format('DD MMM YYYY hh:mm A')}</p>
                  </div>
                </div>
                {post.user.id === user?.id && (
                  <Popover className="relative">
                    <PopoverButton>
                      <svg width="6" height="18" viewBox="0 0 6 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.15186 15.0406C5.15186 16.4005 4.02148 17.5308 2.66162 17.5308C1.29932 17.5308 0.171387 16.4029 0.171387 15.043C0.171387 13.6807 1.29932 12.5504 2.66162 12.5504C4.02148 12.5504 5.15186 13.6783 5.15186 15.0406ZM5.15186 9.1861C5.15186 10.546 4.02148 11.6763 2.66162 11.6763C1.29932 11.6763 0.171387 10.5484 0.171387 9.18854C0.171387 7.82623 1.29932 6.69586 2.66162 6.69586C4.02148 6.69586 5.15186 7.82379 5.15186 9.1861ZM5.15186 3.3316C5.15186 4.69147 4.02148 5.82184 2.66162 5.82184C1.29932 5.82184 0.171387 4.69391 0.171387 3.33405C0.171387 1.97174 1.29932 0.84137 2.66162 0.84137C4.02148 0.84137 5.15186 1.9693 5.15186 3.3316Z" fill="black" />
                      </svg>
                    </PopoverButton>
                    <PopoverPanel anchor="bottom" className="flex flex-col bg-white p-2 border rounded">
                      <button onClick={() => onPressEdit(index)}>Edit</button>
                      <button className="text-red-600" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    </PopoverPanel>
                  </Popover>
                )}
              </div>
              {post.image && (
                <img src={post.image} width={400} alt="post image" />
              )}
              {post.isEdit ? (
                <div className="flex flex-col gap-3">
                  <textarea value={edit} onChange={e => onChangeEditPost(e.target.value)} className="border rounded h-40" />
                  <button
                    className="w-auto bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded py-2 px-5 font-bold items-center justify-center"
                    onClick={() => handleEditPost(post.id)}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p>{post.content}</p>
              )}
              {user && (
                <div className="flex flex-row w-full">
                  {post.likes.length > 0 && post.likes.find(element => element.user_id === user?.id) ? (
                    <button onClick={() => handleLike(post.id)} className="flex flex-1 gap-2 border-y-2 py-2 items-center justify-center bg-indigo-500 hover:bg-indigo-400">
                      <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.13086 8.80273C3.13086 7.42578 3.49414 6.56445 4.24414 5.56836C5.12891 4.39648 6.28906 3.02539 7.16211 1.33203C7.38477 0.892578 7.58984 0.605469 8.01172 0.605469C8.46875 0.605469 8.82031 0.921875 8.82031 1.4668C8.82031 2.49805 7.8418 3.93945 7.8418 4.71875C7.8418 5.15234 8.1875 5.42188 8.70898 5.42188H10.7715C11.3516 5.42188 11.791 5.88477 11.791 6.44727C11.791 6.78125 11.6738 7.04492 11.4922 7.19727C11.3984 7.28516 11.3809 7.34375 11.4746 7.42578C11.627 7.56641 11.7148 7.85352 11.7148 8.12891C11.7148 8.50977 11.5273 8.83789 11.2695 8.99023C11.1582 9.04883 11.1523 9.13086 11.2168 9.21875C11.3457 9.37695 11.4219 9.61133 11.4219 9.875C11.4219 10.3379 11.123 10.6777 10.7598 10.8301C10.6895 10.8594 10.6777 10.918 10.7246 10.9941C10.7949 11.1172 10.8535 11.2812 10.8535 11.5098C10.8535 12.0605 10.4141 12.3418 9.95703 12.4531C9.64062 12.541 9.07812 12.5938 8.32227 12.5938H7.52539C4.80078 12.5938 3.13086 10.9414 3.13086 8.80273ZM0.242188 8.84961C0.242188 7.05078 1.25586 5.64453 2.5625 5.64453H3.40039C2.89648 6.27734 2.32812 7.32617 2.32227 8.79102C2.32227 10.1094 2.75586 11.2695 3.81055 12.0371H2.7793C1.32617 12.0371 0.242188 10.584 0.242188 8.84961Z" fill="white" />
                      </svg>
                      <p className="text-white font-bold">Liked</p>
                    </button>
                  ) : (
                    <button onClick={() => handleLike(post.id)} className="flex flex-1 gap-2 border-y-2 py-2 items-center justify-center hover:bg-gray-100">
                      <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.238525 9.52867C0.238525 7.59508 1.36353 6.01891 2.75806 6.01891H3.83032C5.16626 4.39 5.98657 3.20641 6.67212 1.88805C7.04126 1.18492 7.41626 0.897812 7.9729 0.897812C8.72876 0.897812 9.27954 1.46031 9.27954 2.25133C9.27954 3.39977 8.3186 4.82945 8.3186 5.43883C8.3186 5.55016 8.40063 5.60875 8.52954 5.60875H10.6682C11.512 5.60875 12.1741 6.27672 12.1741 7.12047C12.1741 7.46031 12.0803 7.78258 11.9221 8.01109C12.0334 8.21617 12.0979 8.49742 12.0979 8.76109C12.0979 9.17125 11.9514 9.56383 11.6877 9.83336C11.7698 10.015 11.8167 10.2435 11.8167 10.472C11.8167 10.9408 11.5999 11.3685 11.2131 11.6615C11.2483 11.7904 11.2717 11.9193 11.2717 12.0658C11.2717 12.7572 10.7795 13.3021 9.99438 13.4955C9.59009 13.5951 8.98071 13.6361 8.27759 13.6361H7.49243C6.48462 13.6361 5.58228 13.4076 4.83813 13.015H2.96899C1.47485 13.015 0.238525 11.4212 0.238525 9.52867ZM3.53735 9.49937C3.53735 11.4037 5.14282 12.7748 7.55688 12.7748H8.28345C8.92212 12.7748 9.45532 12.7396 9.78931 12.6576C10.1995 12.5521 10.3987 12.3353 10.3987 12.0658C10.3987 11.9193 10.3811 11.8666 10.2405 11.515C10.1877 11.392 10.217 11.2865 10.3459 11.2103C10.7561 10.9994 10.9495 10.7709 10.9495 10.472C10.9495 10.267 10.8792 10.1439 10.7327 9.88023C10.6506 9.70445 10.7092 9.55797 10.8499 9.44664C11.1077 9.25328 11.2307 9.02477 11.2307 8.76109C11.2307 8.53844 11.1545 8.37437 10.9729 8.10484C10.885 7.99352 10.8967 7.87633 11.0022 7.78258C11.219 7.55992 11.3069 7.39 11.3069 7.12047C11.3069 6.75133 11.0315 6.47594 10.6682 6.47594H8.65259C7.97876 6.47594 7.45142 6.08336 7.45142 5.43883C7.45142 4.5482 8.41235 3.16539 8.41235 2.25133C8.41235 1.93492 8.24829 1.765 8.00806 1.765C7.80298 1.765 7.66235 1.85875 7.45142 2.28648C6.60181 3.97398 5.42407 5.33336 4.57446 6.47008C3.81274 7.49547 3.53735 8.27477 3.53735 9.49937ZM1.10571 9.52867C1.10571 10.9466 1.97876 12.142 2.96899 12.142H3.71899C3.04517 11.4447 2.67017 10.5306 2.67017 9.4818C2.67017 8.49156 2.85181 7.67125 3.26782 6.88609H2.75806C1.89087 6.88609 1.10571 8.06969 1.10571 9.52867Z" fill="black" />
                      </svg>
                      <p className="font-bold">Like</p>
                    </button>
                  )}
                  <button onClick={() => inputRefs.current[index].focus()} className="flex flex-1 gap-2 border-y-2 py-2 items-center justify-center hover:bg-gray-100">
                    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.09766 12.209C3.6875 12.209 3.45898 11.916 3.45898 11.4648V9.94141H3.17773C1.43164 9.94141 0.494141 8.98047 0.494141 7.25781V2.76953C0.494141 1.04688 1.43164 0.0859375 3.17773 0.0859375H10.7246C12.4707 0.0859375 13.4082 1.05273 13.4082 2.76953V7.25781C13.4082 8.97461 12.4707 9.94141 10.7246 9.94141H6.96289L4.94141 11.7402C4.58398 12.0566 4.38477 12.209 4.09766 12.209ZM4.33789 11.1367L6.21289 9.27344C6.43555 9.04492 6.59961 8.99805 6.92773 8.99805H10.7246C11.9023 8.99805 12.4648 8.39453 12.4648 7.25195V2.76953C12.4648 1.62695 11.9023 1.0293 10.7246 1.0293H3.17773C1.99414 1.0293 1.4375 1.62695 1.4375 2.76953V7.25195C1.4375 8.39453 1.99414 8.99805 3.17773 8.99805H3.89844C4.21484 8.99805 4.33789 9.12109 4.33789 9.4375V11.1367Z" fill="black" />
                    </svg>
                    <p className="font-bold">Comment</p>
                  </button>
                </div>
              )}
              {post.likes_count > 0 && (
                <p className="text-sm">Liked by {post.likes_count > 1 ? `${post.likes[0].user.name} and others` : post.likes[0].user.name}</p>
              )}
              <div className="bg-gray-100 w-full p-2 gap-3 flex flex-col rounded">
                <p className="font-bold text-sm">Comments</p>
                <div className="p-2 flex flex-col gap-5">
                  {user && (
                    <div className="flex flex-col gap-2 rounded">
                      <textarea ref={(el) => (inputRefs.current[index] = el)} className="border w-full p-2 rounded" value={comment} onChange={e => onChangeComment(e)} placeholder="Comment" />
                      <div className="flex justify-end">
                        <button
                          className="w-auto bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded py-2 px-5 font-bold items-center justify-center"
                          onClick={() => handleComment(post)}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  )}
                  {post.comments.length > 0 &&
                    post.comments.map((comment, index) => (
                      <div className="flex flex-col gap-2" key={index}>
                        <div className="flex gap-4 items-center">
                          {comment.user?.image ? (
                            <img width={40} src={comment.user?.image} alt="Profile Picture" />
                          ) : (
                            <div className="flex w-auto items-center">
                              <div className="bg-gray-300 p-2.5 rounded-full">
                                <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.71289 8.68555C6.61328 8.68555 4.80664 6.81055 4.80664 4.38867C4.80664 1.99609 6.62305 0.169922 8.71289 0.169922C10.8027 0.169922 12.6191 1.95703 12.6191 4.36914C12.6191 6.81055 10.8027 8.68555 8.71289 8.68555ZM2.16016 17.7285C1.11523 17.7285 0.490234 17.2402 0.490234 16.4297C0.490234 13.9102 3.64453 10.4336 8.70312 10.4336C13.7715 10.4336 16.9258 13.9102 16.9258 16.4297C16.9258 17.2402 16.3008 17.7285 15.2559 17.7285H2.16016Z" fill="black" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <p className="font-bold text-sm">{comment.user.name}</p>
                            <p className="text-xs">{moment(comment.created_at).local().format('DD MMM YYYY hh:mm A')}</p>
                          </div>
                        </div>
                        <p className="text-md">{comment.content}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )) : (
            <p>no post yet</p>
          )}
        </div>
      </div>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold">Edit Profile</DialogTitle>
            {error !== '' && (
              <div className="bg-red-600 px-2 py-1 rounded">
                <p className="text-white">{error}</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label for="name">Name<span className="text-red-600">*</span></label>
                <input defaultValue={user?.name} onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="name" name="name" />
              </div>
              <div className="flex flex-col gap-1">
                <label for="email">Email<span className="text-red-600">*</span></label>
                <input defaultValue={user?.email} disabled onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="email" name="email" />
              </div>
              <div className="flex flex-col gap-1">
                <label for="bio">Bio</label>
                <textarea defaultValue={user?.bio} onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" id="bio" name="bio" />
              </div>
              <div className="flex flex-col gap-1">
                <label for="interests">Interest</label>
                <input defaultValue={user?.interests} onChange={e => onChange(e)} className="border-2 rounded py-1 px-2" type="text" id="interests" name="interests" />
              </div>
              <div className="flex flex-col gap-1">
                <label for="image">Profile Picture</label>
                <input onChange={e => onChange(e)} type="file" id="image" name="image" />
              </div>
            </div>
            <div className="flex gap-4 items-end justify-end">
              <button className="bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/50 text-indigo-500 rounded p-2 font-bold items-center justify-center" onClick={() => setIsOpen(false)}>Cancel</button>
              <button className="px-5 bg-indigo-500 border-2 border-indigo-500 shadow-lg shadow-indigo-500/50 text-white rounded p-2 font-bold items-center justify-center" onClick={handleSaveProfile}>Save</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default Posts;
