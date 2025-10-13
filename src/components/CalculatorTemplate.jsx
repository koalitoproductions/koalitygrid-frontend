import { useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const CalculatorTemplate = ({ onClose }) => {
  const [voltage, setVoltage] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInput = (name, value) => {
    if (!value || isNaN(value) || parseFloat(value) < 0) {
      return true;
    }
    return false;
  };

  const handleInputChange = (setter, name) => (e) => {
    const value = e.target.value;
    setter(value);
    setErrors((prev) => ({
      ...prev,
      [name]: validateInput(name, value) ? true : undefined,
    }));
  };

  const validateInputs = () => {
    const newErrors = {};
    const fields = [
      { name: 'voltage', value: voltage },
    ];

    fields.forEach(({ name, value }) => {
      if (!value || isNaN(value) || parseFloat(value) < 0) {
        newErrors[name] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = async () => {
    if (!validateInputs()) {
      setResult({ error: 'Vänligen fyll i alla fält med giltiga siffror.' });
      return;
    }

    const data = {
      voltage: parseFloat(voltage),
    };

    try {
      setResult({
        totalVoltage: data.voltage,
      });
    } catch (error) {
      console.error('Error calculating:', error);
      setResult({ error: 'Calculation failed. Please check inputs.' });
    }
  };

  useKeyboardShortcuts({
    onEnter: calculate,
  });

  return (
    <div className="flex items-center justify-center p-4 bg-[#1c1c1c]">
      <div className="max-w-lg w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="calc-form-label">Spänning:</label>
            <div className="flex">
              <input
                type="number"
                value={voltage}
                onChange={handleInputChange(setVoltage, 'voltage')}
                className={`calc-form-input-split ${errors.voltage ? 'calc-form-input-error' : ''}`}
                placeholder="Ange spänning"
              />
              <span className="calc-form-input-span">V</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={calculate}
            className="calc-form-submit-button"
          >
            Beräkna
          </button>
        </div>
        <div>
          {result && (
            <div className="mt-4 p-4 bg-[#383838] rounded">
              {result.error ? (
                <p className="text-red-400 font-bold mb-2">{result.error}</p>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-[#fa7532] mb-2">Resultat:</h3>
                  <p className="text-gray-200">Total spänning: {result.totalVoltage} V</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorTemplate;