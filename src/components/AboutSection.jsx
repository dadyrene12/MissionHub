import React from 'react';
import { Briefcase, Building, Users, Home, Award, Target, Sparkles, Quote } from 'lucide-react';

const AboutSection = ({ aboutStats, testimonials, StatCard, TestimonialCard }) => {
  // A more descriptive and visually appealing StatCard
  const StyledStatCard = ({ icon, number, label, unit }) => (
    <div className="group relative bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4 group-hover:bg-blue-100 transition-colors duration-300">
          {React.cloneElement(icon, { className: 'w-8 h-8 text-blue-600' })}
        </div>
        <div className="text-3xl md:text-4xl font-extrabold text-gray-900 tabular-nums">
          {number.toLocaleString()}{unit}
        </div>
        <div className="text-sm md:text-base font-medium text-gray-600 mt-1">{label}</div>
      </div>
    </div>
  );

  // Redesigned Mission/Vision Card
  const FeatureCard = ({ icon, title, children }) => (
    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500">
      <div>
        <div className="flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-6">
          {React.cloneElement(icon, { className: 'w-8 h-8 text-emerald-600' })}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );

  // A more testimonial-style card with image
  const StyledTestimonialCard = ({ testimonial }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col justify-between h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
      <div>
        <Quote className="w-10 h-10 text-blue-200 mb-4" />
        <p className="text-gray-700 italic leading-relaxed mb-6">"{testimonial.content}"</p>
      </div>
      <div className="flex items-center">
        <img
          src={`https://i.pravatar.cc/150?u=${testimonial.avatar}`} // Dynamic avatar based on initials
          alt={testimonial.name}
          className="w-12 h-12 rounded-full mr-4 border-2 border-gray-200"
        />
        <div>
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-500">{testimonial.position} at {testimonial.company}</p>
        </div>
      </div>
    </div>
  );

  return (
    // Main section with a light, gradient background
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 mb-4">
            Why Choose Mission Hub?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            The future of job searching, powered by AI and built for your success.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          <StyledStatCard icon={<Briefcase />} number={aboutStats.jobs} label="Active Jobs" />
          <StyledStatCard icon={<Building />} number={aboutStats.companies} label="Partner Companies" />
          <StyledStatCard icon={<Users />} number={aboutStats.candidates} label="Candidates" />
          <StyledStatCard icon={<Award />} number={aboutStats.successRate} unit="%" label="Success Rate" />
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-20">
          <FeatureCard icon={<Target />} title="Our Mission">
            To revolutionize the recruitment process by connecting the right talent with the right opportunities using advanced AI matching technology, saving time and creating successful career paths for everyone.
          </FeatureCard>
          <FeatureCard icon={<Sparkles />} title="Our Vision">
            To be the world's most trusted and powerful career platform, a place where professional growth is guaranteed, and the journey to a dream job is seamless and empowering.
          </FeatureCard>
        </div>

        {/* Testimonials Section with a distinct light background */}
        <div className="bg-blue-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4 flex items-center justify-center">
            <Home size={30} className="mr-3 text-blue-600" />
            Hear From Our Users
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Don't just take our word for it. See what real professionals have to say about their experience.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map(t => (
              <StyledTestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;