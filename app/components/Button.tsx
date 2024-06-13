import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
}

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Button: React.FC<ButtonProps> = ({ children }) => {
  return <StyledButton type='submit'>{children}</StyledButton>;
};

export default Button;
