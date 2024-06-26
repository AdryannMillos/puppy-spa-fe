"use client";
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import api from '../service/api';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchableSelect from '../components/SearchableSelect';

const Container = styled.div`
  max-width: 600px;
  margin: 25px auto;
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

const ListItem = styled.div`
  background-color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ListContainer = styled.div`
  margin-top: 20px;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
`;

const InfoWrapper = styled.div`
display: flex;
align-items: center;
justify-content: space-around;
`;

const AddPuppy: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');
  const [puppy, setPuppy] = useState<any>();

  const getCurrentTime = (timeString: any) => {
    const date = new Date(timeString);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }

      let response;
      if (puppy) {
        console.log(puppy)
        response = await api.put(`/puppy/${puppy.id}/update`, {
          name: puppy.name,
          ownerName: puppy.ownerName,
          birthday: puppy.birthday,
          breed: puppy.breed,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Puppy updated:', response.data);
      } else {
        response = await api.post('/puppy/store', {
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
      }

      router.push('/waiting-list');
    } catch (error) {
      console.error('Error submitting puppy:', error);
    }
  };
  const handleInputChange = (key: any, value: any) => {
    setPuppy((prevPuppy: any) => ({
      ...prevPuppy,
      [key]: value,
    }));
  };
  return (
    <>
      <Container>
      <Title>Search For a Puppy</Title>
        <SearchableSelect setPuppy={setPuppy} />
      </Container>
      {puppy && (
        <Container>
          <Title>Update a Puppy</Title>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={puppy.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Puppy Name"
            />
            <Input
              type="text"
              value={puppy.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              placeholder="Owner Name"
            />
            <Input
              type="text"
              value={puppy.breed}
              onChange={(e) => handleInputChange('breed', e.target.value)}
              placeholder="Breed"
            />
            <Input
              type="text"
              value={puppy.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              placeholder="Birthday (YYYY-MM-DD)"
            />
            <Button>Update</Button>
            <ListContainer>
              {puppy?.appointment?.map((item: any, index: any) => (
                <ListItem key={item.id}>
                  <InfoWrapper>
                    <Info>
                      <span>service: {item.service}</span>
                      <span>date: {item.date}</span>
                      <span>Arrived: {getCurrentTime(item.arrivalTime)}</span>
                    </Info>
                  </InfoWrapper>
                </ListItem>
              ))}
              </ListContainer>

          </Form>
        </Container>
      )}
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
            placeholder="Birthday (YYYY-MM-DD)"
          />
          <Button>Submit</Button>
        </Form>
      </Container>
    </>
  );
};

export default AddPuppy;
