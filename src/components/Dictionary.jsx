import { useState, useEffect } from 'react';
import api from '../config/axios';

const Dictionary = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [foundTerm, setFoundTerm] = useState(null);
  const [selectedResult, setSelectedResult] = useState(0);

  const fetchSearchResults = async () => {
    try {
      const response = await api.get(`/api/terms/search/?q=${debouncedQuery}`);
      setResults(response.data);
      setSelectedResult(0);
    } catch (error) {
      console.error('Error fetching calc tools:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const openTermDefinition = (name, description) => {
    setResults([]);
    setFoundTerm({name: name, description: description});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (results.length > 0) {
      openTermDefinition(results[selectedResult].name, results[selectedResult].description);
    } else {
      fetchSearchResults();
    }
  };

  const handleResultsNavigation = (event) => {
    if(results.length === 0) {
      return;
    }
    if(event.key === 'ArrowUp') {
      if(selectedResult > 0) {
        setSelectedResult(selectedResult - 1);
      } else {
        setSelectedResult(results.length - 1);
      }
    } else if(event.key === 'ArrowDown') {
      if(selectedResult < results.length - 1) {
        setSelectedResult(selectedResult + 1);
      } else {
        setSelectedResult(0);
      }
    }
    console.log(selectedResult);
  };

  return (
    <div className="justify-center">
      <h2 className="text-3xl font-semibold mb-6 text-white-200">Sök efter termer</h2>
      <form onSubmit={handleSubmit} onKeyDown={handleResultsNavigation}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          placeholder="Sök efter termer..."
          className="w-full p-2 bg-white border border-gray-300 text-gray-900 focus:ring-[#fa7532] focus:border-[#fa7532] rounded-md"
        />
      </form>
      {results &&
      <ul className="mt-2 bg-white rounded-lg shadow-sm divide-y divide-gray-200 text-gray-900 border-[#fa7532] border-solid border-2">
        {results.map((term, index) => (
          <li 
            key={term.id} 
            onClick={() => openTermDefinition(term.name, term.description)}
            className={`p-2 cursor-pointer hover:bg-[#ffffee] ${index === selectedResult ? 'bg-blue-50' : ''}`}
          >
            {term.name}
          </li>
        ))}
      </ul>
      }
      {foundTerm &&
        <div className="mt-4 p-4 bg-[#383838] rounded-lg">
          <h2 className="text-3xl font-semibold mb-6 text-white-200">Term: {foundTerm.name}</h2>
          <p className="text-gray-200">{foundTerm.description}</p>
        </div>
      }
    </div>
  );
};

export default Dictionary;