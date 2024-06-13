"use client"
import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import api from '../service/api';
import Input from '../components/Input';
import Button from '../components/Button';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: black;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const AddPuppy: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await api.post('/puppy/store', {
        name,
        ownerName,
        breed,
        birthday,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Puppy created:', response.data);
      router.push('/waiting-list');
    } catch (error) {
      console.error('Error creating puppy:', error);
    }
  };

  return (
    <Container>
      <Title>Add a Puppy</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Puppy Name"
        />
        <Input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Owner Name"
        />
        <Input
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Breed"
        />
        <Input
          type="text"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          placeholder="Birthday (MM-DD-YYYY)"
        />
        <Button>Submit</Button>
      </Form>
    </Container>
  );
};

export default AddPuppy;
