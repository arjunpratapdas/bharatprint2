import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-[#626C71] dark:text-gray-300 hover:text-[#134252] dark:hover:text-white transition-colors mb-4"
      data-testid="back-button"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
