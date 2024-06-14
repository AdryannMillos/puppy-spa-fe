"use client";
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import styled from 'styled-components';

const StyledSelect = styled(Select)`
margin: 0px 0 15px 0;
  .react-select__control {
    background-color: #f0f0f0;
    border-color: #ccc;
  }
  .react-select__menu {
    background-color: #fff;
  }
  .react-select__option {
    color: #333;
  }
  .react-select__option--is-selected {
    background-color: #007bff;
    color: #fff;
  }
`;

const SearchableSelect = ({setPuppyId = (data) => {return data}, setPuppy = (data) =>{return data}}) => {
  const [options, setOptions] = useState([]);
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const isMounted = useRef(true);

  const fetchOptions = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }
  
    const endpoint = '/puppy';
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
  
    const data = await response.json();
    setPuppies(data)
    return data.map(item => ({ value: item.id, label: `${item.name} / ${item.ownerName}` }));
  };

  useEffect(() => {
    isMounted.current = true;
    const fetchInitialOptions = async () => {
      setLoading(true);
      try {
        const initialOptions = await fetchOptions('');
        if (isMounted.current) {
          setOptions(initialOptions);
        }
      } catch (error) {
        console.error('Error fetching initial options:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialOptions();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
     setPuppyId(selectedOption?.value);
    const selectedPuppie = puppies.find(item => item?.id === selectedOption.value)

   setPuppy(selectedPuppie);
  };

  return (
    <StyledSelect
      options={options}
      placeholder="Search..."
      noOptionsMessage={() => 'No options'}
      isLoading={loading}
      onChange={handleChange}
      value={selectedOption}
    />
  );
};

export default SearchableSelect;
