"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import api from '../service/api';
import Link from 'next/link';
import Button from '../components/Button';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';

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

    const [list, setList] = useState<{ attended: Appointment[]; unattended: Appointment[] }>({ attended: [], unattended: [] });

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
      console.log( response.data.attended, )
      console.log( response.data.unattended)
      setList({
        attended: response.data.attended,
        unattended: response.data.unattended,
      });;
      
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
        arrivalTime: "2024-06-1205:52:56",
        attended: false,
        puppyId

      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Puppy scheduled:', response.data);
      router.push('/waiting-list');
    } catch (error) {
      console.error('Error creating puppy:', error);
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: number) => {
    event.dataTransfer.setData('id', id.toString());
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };


  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, newOrder: number) => {
    event.preventDefault();
    const id = +event.dataTransfer.getData('id');
  
    let movedItem: Appointment | undefined;
    let updatedAttended: Appointment[] = [...list.attended];
    let updatedUnattended: Appointment[] = [...list.unattended];
  
    movedItem = updatedAttended.find(item => item.id === id);
    if (movedItem) {
      movedItem.order = newOrder;
      updatedAttended = updatedAttended.map(item => (item.id === id ? { ...item, order: newOrder } : item));
    } else {
      movedItem = updatedUnattended.find(item => item.id === id);
      if (movedItem) {
        movedItem.order = newOrder;
        updatedUnattended = updatedUnattended.map(item => (item.id === id ? { ...item, order: newOrder } : item));
      }
    }
  
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }
  
      const updatedList = movedItem?.attended ? updatedAttended : updatedUnattended;
  
      await api.put(`/appointment/${id}/update`, movedItem, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setList({
        attended: updatedAttended,
        unattended: updatedUnattended,
      });

      await fetchList(date)
    } catch (error) {
      console.error('Error updating item order:', error);
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
      <Link href="/add-puppy">
        Add a puppy
      </Link>
      <ListContainer>
        <h2>Unattended</h2>
        {list?.unattended.map((item, index) => (
          <ListItem
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index + 1)}
          >
            <DragHandle>::</DragHandle>
            <span>order: {index + 1}</span>
            <span>service: {item.service}</span>
            <span>arrival time: {item.arrivalTime}</span>
            <span>attended: {item.attended ? 'Yes' : 'No'}</span>
            <span>{}</span>
          </ListItem>
        ))}

      </ListContainer>
      <ListContainer>
        <h2>Attended</h2>

        {list?.attended.map((item, index) => (
          <ListItem
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index + 1)}
          >
            <DragHandle>::</DragHandle>
            <span>order: {index + 1}</span>
            <span>service: {item.service}</span>
            <span>arrival time: {item.arrivalTime}</span>
            <span>attended: {item.attended ? 'Yes' : 'No'}</span>
            <span>{}</span>
          </ListItem>
        ))}
      </ListContainer>
    </Container>
    <Container>
    <Title>Add a Puppy</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service"
        />
        <Input
          type="text"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          placeholder="ArrivalTime"
        />
        <Input
          type="text"
          value={puppyId}
          onChange={(e) => setPuppyId(e.target.value)}
          placeholder="Puppy Id"
        />
        <Button>Submit</Button>
      </Form>
    </Container>
    </>
  );
};

export default WaitingList;
