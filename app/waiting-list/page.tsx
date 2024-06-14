"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import api from '../service/api';
import Link from 'next/link';
import Button from '../components/Button';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import DragableList from '../components/DragableList';
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

const DateInput = styled.input`
  padding: 8px;
  margin-bottom: 10px;
  font-size: 16px;
`;

const ListContainer = styled.div`
  margin-top: 20px;
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


const DragHandle = styled.span`
  cursor: move;
`;

interface Appointment {
  id: number;
  service: string;
  arrivalTime: string;
  attended: boolean;
  puppy: string;
  order: number;
}

const WaitingList: React.FC = () => {
  const router = useRouter();

    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

    const [attended, setAttended] = useState<Appointment[]>([]);
    const [unattended, setUnattended] = useState<Appointment[]>([]);

    const [service, setService] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [puppyId, setPuppyId] = useState('');


  const fetchList = async (selectedDate: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await api.get(`/appointment`, {
        params: {
          date: selectedDate,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        }
      });

      setAttended(response.data.attended);
      setUnattended(response.data.unattended);
      
    } catch (error) {
      console.error('Error fetching list:', error);
    }
  };

  useEffect(() => {
    fetchList(date);
  }, [date]); 

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    setDate(selectedDate);
    fetchList(selectedDate);
  };



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await api.post('/appointment/schedule-puppy', {
        service,
        date,
        arrivalTime: new Date(),
        attended: false,
        puppyId

      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Puppy scheduled:', response.data);
      setArrivalTime('');
      setService('');
      setPuppyId('');
      fetchList(date);
    } catch (error) {
      console.error('Error creating puppy:', error);
    }
  };

  return (
    <>
    <Container>
      <Title>Waiting List</Title>
      
      <DateInput
        type="date"
        value={date}
        onChange={handleDateChange}
      />
      <Link href="/puppies">
        See Puppies
      </Link>
      <Title>Unattended</Title>
      <DragableList items={unattended} setItems={setUnattended} fetchList={fetchList} date={date}></DragableList>
      <Title>Attended</Title>
      <DragableList items={attended} setItems={setAttended} fetchList={fetchList} date={date}></DragableList>
    </Container>
    <Container>
    <Title>Schedule a Puppy</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service"
        />
        <SearchableSelect setPuppyId={setPuppyId}></SearchableSelect>
        <Button>Submit</Button>
      </Form>
    </Container>
    </>
  );
};

export default WaitingList;
