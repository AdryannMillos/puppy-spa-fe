"use client"
import React from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from 'next/link';



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

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  font-size: 14px;
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
const DragableList: React.FC<any> = ({ items, setItems, fetchList, date }) => {
    const handleDragStart = () => {
        if(window.navigator.vibrate) window.navigator.vibrate(100)
    }

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
    
        let newItems;
    
        if (result.combine) {
            newItems = [...items];
            newItems.splice(result.source.index, 1);
            setItems(newItems);
            fetchList(date);
            await updateOrderOnBackend(newItems);
            return;
        }
    
        newItems = reorder(items, result.source.index, result.destination.index);
        setItems(newItems);
        fetchList(date);
        await updateOrderOnBackend(newItems);
    };
    
    function reorder(list, startIndex, endIndex) {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return  result.map((item,index) => {item.order = index+1; return item})
    }
    
    const updateOrderOnBackend = async (items) => {
        try {
            const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }
  
            const updatePromises = items.map((item, index) =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/${item.id}/update`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    body: JSON.stringify(item),
                })
            );
    
            const responses = await Promise.all(updatePromises);
            const results = await Promise.all(responses.map(res => res.json()));
    
            results.forEach(result => {
                if (!result.success) {
                    throw new Error(`Failed to update item ${result.id}`);
                }
            });
            fetchList(date);

            console.log('Order updated successfully for all items');
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };
    const getCurrentTime = (timeString) => {
        const date = new Date(timeString);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
      
        return `${hours}:${minutes}:${seconds}`;
      };
    const handleAttendPuppy = async (id) => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No token found');
          }
      
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/${id}/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ attended: true }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to attend the puppy');
          }
      
          const data = await response.json();
          fetchList(date);
          console.log('Appointment attended successfully:', data);
          // Optionally, refresh the data or update the state here
        } catch (error) {
          console.error('Error attending the puppy:', error);
        }
      };

      const handleDeleteAppointment = async (id) => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No token found');
          }
      
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/${id}/delete`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (!response.ok) {
            throw new Error('Failed to delete the appointment');
          }
      
          console.log('Appointment deleted successfully');
          fetchList(date);
          // Optionally, refresh the data or update the state here
        } catch (error) {
          console.error('Error deleting the appointment:', error);
        }
      };
      

    return (
        <DragDropContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Droppable droppableId='droppable'>
                {(droppableProvided) => (
                        <ListContainer

                        {...droppableProvided.droppableProps}
                        ref={droppableProvided.innerRef}
                    >
                        {items.map((item, index) => (
                            <Draggable
                                draggableId={String(item.id)}
                                index={index}
                                key={item.id}
                            >
                                {(draggableProvided) => (
          <ListItem
          {...draggableProvided.draggableProps}
                                        {...draggableProvided.dragHandleProps}
                                        ref={draggableProvided.innerRef}
                                    >
                                        <InfoWrapper>
                                            <Info>
                                        <span>{item.order} </span>
                                        <span>service: {item.service}</span>
                                        <span>Arrived: {getCurrentTime(item.arrivalTime)}</span>
                                        <span>puyppy: {`${item.puppy.name} / ${item.puppy.ownerName}`}</span>
                                        </Info>
                                        <Actions>
                                            <Link href="#" onClick={(e) => { e.preventDefault(); handleAttendPuppy(item.id); }}>Attend</Link>
                                            <Link href="#" onClick={(e) => { e.preventDefault(); handleDeleteAppointment(item.id); }}>Delete</Link>
                                        </Actions>
                                        </InfoWrapper>
                                        </ListItem>
                                )}
                            </Draggable>
                        ))}
                        {droppableProvided.placeholder}
                        </ListContainer>

                )}
            </Droppable>
        </DragDropContext>
    );
}

export default DragableList;
