import { useState, useEffect } from 'react';
import api from '../config/axios';
import { useModal } from './ModalContext';

const ConversionsSection = () => {
  const [conversionTools, setConversionTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();
  const [layout, setLayout] = useState('list');

  useEffect(() => {
    const fetchConversionTools = async () => {
      try {
        const response = await api.get('api/conversion-tools/');
        setConversionTools(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calc tools:', error);
        setLoading(false);
      }
    };
    fetchConversionTools();
  }, []);

  if (loading) {
    return <div className="text-[#e0e0e0]">Loading...</div>;
  }

  return (
    <div>
      <div className="flex">
        <h2 className="text-3xl font-semibold mb-6 text-white-200">Omvandlingsverktyg</h2>
        <div className="flex ml-4">
          <div 
            className={`text-[1rem] text-[#1c1c1c] mr-2 bg-[#fa7532] rounded-full w-[30px] h-[30px] flex justify-center items-center cursor-pointer ${layout === 'list' ? 'border-2 border-blue-200' : ''}`}
            id="layout-list"
            onClick={() => setLayout('list')}
          >
            <i className="fa fa-bars"></i>
          </div>
          <div 
            className={`text-[1rem] text-[#1c1c1c] mr-2 bg-[#fa7532] rounded-full w-[30px] h-[30px] flex justify-center items-center cursor-pointer ${layout === 'grid' ? 'border-2 border-blue-200' : ''}`}
            id="layout-grid"
            onClick={() => setLayout('grid')}
          >
            <i className="fa fa-th"></i>
          </div>
        </div>
      </div>
      <div className={`grid gap-4 mb-4 ${layout === 'grid' ? 'lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1' : ''}`}>
      {conversionTools.map((tool) => (
        <div
          key={tool.id}
          className="bg-[#282828] rounded-lg p-3 flex items-center cursor-pointer hover:bg-[#383838] hover:shadow-md transition transform hover:-translate-y-0.5"
          onClick={() => openModal({ ...tool, component: tool.component, formula: tool.formula_info, info: tool.description, folder: 'conversion-tools' })}
        >
          <div className="text-[1rem] text-[#1c1c1c] mr-8 bg-[#fa7532] rounded-full w-[30px] h-[30px] flex justify-center items-center">
            <i className="fas fa-sync-alt"></i>
          </div>
          <h3 className="text-base font-medium text-[#e0e0e0]">{tool.name}</h3>
        </div>
      ))}
      </div>
    </div>
  );
}

export default ConversionsSection;