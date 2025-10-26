import { useState, useEffect } from 'react';
import api from '../config/axios';
import { useModal } from './ModalContext'; // Import ModalProvider

const CalculationsSection = () => {
  const [calculationTools, setCalculationTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    const fetchCalculationTools = async () => {
      try {
        const response = await api.get('api/calculation-tools/');
        setCalculationTools(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calc tools:', error);
        setLoading(false);
      }
    };
    fetchCalculationTools();
  }, []);

  if (loading) {
    return <div className="text-[#e0e0e0]">Loading...</div>;
  }

  return (
    <div>
      {calculationTools.no_category && calculationTools.no_category.length > 0 && (
        <div className="grid gap-4 mb-4">
          {calculationTools.no_category.map((tool) => (
            <div
              key={tool.id}
              className="bg-[#282828] rounded-lg p-4 flex items-center cursor-pointer hover:bg-[#383838] hover:shadow-md transition transform hover:-translate-y-0.5"
              onClick={() => openModal({ ...tool, component: tool.component, formula: tool.formula_info, info: tool.description, folder: 'calculation-tools' })}
            >
              <div className=" text-[1.2rem] text-[#1c1c1c] mr-8 bg-[#fa7532] rounded-full w-[30px] h-[30px] flex justify-center items-center">
                <i className="fas fa-calculator"></i>
              </div>
              <h3 className="text-base font-medium text-[#e0e0e0]">{tool.name}</h3>
            </div>
        ))}
        </div>
      )}
      {Object.keys(calculationTools)
        .filter((key) => key !== 'no_category')
        .map((key) => (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-white-200">{key}</h2>
            <div className="grid gap-4 mb-4">
            {calculationTools[key].map((tool) => (
              <div
                key={tool.id}
                className="bg-[#282828] rounded-lg p-3 flex items-center cursor-pointer hover:bg-[#383838] hover:shadow-md transition transform hover:-translate-y-0.5"
                onClick={() => openModal({ ...tool, component: tool.component, formula: tool.formula_info, info: tool.description, folder: 'calculation-tools' })}
              >
                <div className=" text-[1.2rem] text-[#1c1c1c] mr-8 bg-[#fa7532] rounded-full w-[30px] h-[30px] flex justify-center items-center">
                  <i className="fas fa-calculator"></i>
                </div>
                <h3 className="text-base font-medium text-[#e0e0e0]">{tool.name}</h3>
              </div>
            ))}
            </div>
          </>
      ))}
    </div>
  );
}

export default CalculationsSection;