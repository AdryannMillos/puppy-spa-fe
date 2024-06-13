import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type: string;
  value: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  font-size: 16px;
`;

const Input: React.FC<InputProps> = ({ type, value, placeholder, onChange }) => {
  return <StyledInput type={type} value={value} placeholder={placeholder} onChange={onChange} />;
};

export default Input;
