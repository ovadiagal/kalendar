import React from 'react';
import { Text, TextProps } from 'react-native';

interface TitleProps extends TextProps {
  className?: string;
}

const Title: React.FC<TitleProps> = ({ className, children, ...props }) => {
  return (
    <Text className={`text-2xl font-bold ${className}`} {...props}>
      {children}
    </Text>
  );
};

export default Title;
