"use client"
import React from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";



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

const DragableList: React.FC<any> = ({ items, setItems }) => {
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
            await updateOrderOnBackend(newItems);
            return;
        }
    
        newItems = reorder(items, result.source.index, result.destination.index);
        setItems(newItems);
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
    
            console.log('Order updated successfully for all items');
        } catch (error) {
            console.error('Failed to update order:', error);
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
                                        <span>{item.order} </span>
                                        <span>service: {item.service}</span>
                                        <span>puyppy: {`${item.puppy.name} / ${item.puppy.ownerName}`}</span>
                                       
                                      
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
