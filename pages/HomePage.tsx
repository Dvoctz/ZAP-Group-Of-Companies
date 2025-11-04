
import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANIES } from '../constants';
import { Company } from '../types';

const CompanyCard: React.FC<{ company: Company }> = ({ company }) => {
  const cardContent = (
    <div className="bg-gray-800 rounded-xl p-6 h-full flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:bg-gray-700 shadow-lg hover:shadow-cyan-500/50">
      {company.icon}
      <h3 className="mt-4 text-xl font-bold text-white">{company.name}</h3>
      <p className="mt-2 text-gray-400 text-sm flex-grow">{company.description}</p>
      <span className="mt-4 inline-block bg-cyan-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
        {company.isExternal ? 'Visit Site' : 'Enter Store'}
      </span>
    </div>
  );

  if (company.isExternal) {
    return (
      <a href={company.externalLink} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={`/store/${company.slug}`} className="block">
      {cardContent}
    </Link>
  );
};


const HomePage: React.FC = () => {
  return (
    <main className="relative container mx-auto px-4 py-8 sm:py-16 min-h-screen">
      <div className="absolute top-6 right-6 z-10">
        <Link 
          to="/admin" 
          className="text-sm bg-gray-800/50 backdrop-blur-sm text-gray-300 font-medium py-2 px-5 rounded-full shadow-lg hover:bg-gray-700/70 hover:text-white transition-colors duration-300"
        >
          Admin Panel
        </Link>
      </div>

      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          <span className="block">ZAP Group</span>
          <span className="block text-cyan-400">Of Companies</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
          Your destination for quality, innovation, and creativity.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {COMPANIES.map((company) => (
          <CompanyCard key={company.slug} company={company} />
        ))}
      </div>
    </main>
  );
};

export default HomePage;
