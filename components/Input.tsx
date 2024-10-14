import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return <TextInput className={`rounded border p-2 ${className}`} {...props} />;
};

export default Input;
