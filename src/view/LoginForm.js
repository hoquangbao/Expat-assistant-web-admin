import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Redirect } from 'react-router';
import { login } from '../firebase/auth'

function LoginForm({ props }) {
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState("");


  const Logout = () => {
    setUser({ name: "", email: "" })
    console.log("Logout")
  }

  const submitHandler = e => {
    e.preventDefault();

    const data = {
      email: user.email,
      password: user.password
    }

    axios.post('https://hcmc.herokuapp.com/api/authen/login', data)
      .then(res => {
        localStorage.setItem('token', res.data.token)
        login(user)

      })

  }
  useEffect(() => {
    if (localStorage.getItem('token') !== "") {
      return <Redirect to={{
        pathname: "/home"
      }} />
    };
  })

  return (
    <div>
      <form onSubmit={submitHandler}>
        <div className="form-inner">
          <h2>Login</h2>
          <div className="form-group">
            <label htmlFor="email">Email: </label>
            <input
              type="text"
              name="email"
              id="email"
              onChange={e => setUser({ ...user, email: e.target.value })}
              value={user.email} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={e => setUser({ ...user, password: e.target.value })}
              value={user.password} />
          </div>
          <input type="submit" value="Login" />
        </div>
      </form>
    </div>
  )
}

export default LoginForm
