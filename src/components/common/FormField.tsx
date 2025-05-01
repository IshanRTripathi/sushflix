import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  className,
  ...rest
}) => {
  const inputClassName = `mt-1 block w-full rounded-md shadow-sm ${
    error ? 'border-red-300' : 'border-gray-300'
  } focus:border-indigo-500 focus:ring-indigo-500 ${className || ''}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={inputClassName}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
