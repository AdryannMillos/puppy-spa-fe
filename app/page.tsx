"use client"
import styled from 'styled-components'
import { useState } from 'react'
import React from 'react'
import api from './service/api'
import { useRouter } from 'next/navigation'

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  input {
    margin: 0.5rem 0;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 3px;
    width: 100%;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    background: #0070f3;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    margin-top: 1rem;

    &:hover {
      background: #005bb5;
    }
  }
`

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('');
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/auth/signin', {
        email,
        password
      });
      localStorage.setItem("access_token", response.data.access_token);
      router.push('/waiting-list')
    

    } catch (error) {
      if (error.response) {
        console.error('Sign-in error:', error.response.data);
        setError(error.response.data.message);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please try again later.');
      } else {
        console.error('Request setup error:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <LoginWrapper>
      <LoginForm onSubmit={handleSubmit}>
        <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </LoginForm>
    </LoginWrapper>
  )
}
