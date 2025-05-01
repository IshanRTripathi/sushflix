import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  buttonText: string;
  loadingText: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  buttonText,
  loadingText,
  disabled,
  ...rest
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      {...rest}
    >
      {isLoading ? loadingText : buttonText}
    </button>
  );
};

export default SubmitButton;
