// src/components/UIHelpers.jsx
import React from 'react';
import { Star, Briefcase, Building, Users, Award, Target, Sparkles } from 'lucide-react';

// StatCard
export const StatCard = ({ icon, number, label, unit = '' }) => (
  <div className="p-6 rounded-xl shadow-md text-center bg-white border border-blue-100">
    {icon}
    <p className="text-4xl font-extrabold mt-3 mb-1 text-gray-900">
      {number.toLocaleString()}{unit}
    </p>
    <p className="text-gray-500 font-medium">{label}</p>
  </div>
); 

// TestimonialCard
export const TestimonialCard = ({ testimonial }) => (
  <div className="p-6 rounded-xl shadow-lg relative bg-white border-t-4 border-blue-500">
    <QuoteIcon className="w-8 h-8 text-blue-200 absolute top-4 right-4" />
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg mr-4">
        {testimonial.avatar}
      </div>
      <div>
        <p className="font-bold text-gray-900">{testimonial.name}</p>
        <p className="text-sm text-gray-500">{testimonial.position} at {testimonial.company}</p>
      </div>
    </div>
    <p className="text-gray-700 italic">"{testimonial.content}"</p>
    <div className="flex mt-3">
      {Array(testimonial.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />)}
      {Array(5 - testimonial.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-gray-300" />)}
    </div>
  </div>
);


// QuoteIcon
export const QuoteIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 14.725c0-5.141 3.27-7.914 7.16-10.45l.93.94c-2.455 1.7-4.34 3.51-4.34 6.785h4.15v6H13v-3.27zm-10 0c0-5.141 3.27-7.914 7.16-10.45l.93.94c-2.455 1.7-4.34 3.51-4.34 6.785h4.15v6H3v-3.27z"/>
  </svg>
);

export const UIHelpers = {
  StatCard,
  TestimonialCard,
  QuoteIcon
};