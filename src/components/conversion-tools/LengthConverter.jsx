import { useState } from 'react';
import Qty from 'js-quantities';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

function LengthConverter() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [unit, setUnit] = useState('km');

  const units = {
    'km': 'Kilometer',
    'm': 'Meter',
    'cm': 'Centimeter',
    'mm': 'Millimeter',
    'ft': 'Fot',
    'in': 'Tum',
    'mi': 'Miles',
    'yd': 'Yard'
  };

  const validateInput = () => {
    if (!value || isNaN(value) || parseFloat(value) < 0) {
      return false;
    }
    return true;
  };

  const calculate = async () => {
    if (!validateInput()) {
      setResult({ error: 'Vänligen fyll i fältet med en giltig siffra.' });
      return;
    }

    const resultData = [];
    Object.keys(units).forEach((key) => {
      if (key !== unit) {
        try {
          const converted = Qty(`${value} ${unit}`).to(key).scalar;
          resultData.push({
            unit: key,
            text: units[key],
            result: converted,
          });
        } catch (err) {
          console.error(`Conversion error from ${unit} to ${key}:`, err);
        }
      }
    });
    setResult({ data: resultData });
  };

  useKeyboardShortcuts({
    onEnter: calculate,
  });

  // Rest of the component remains the same
  return (
    <div className="rounded-lg flex items-center justify-center p-4 bg-[#1c1c1c]">
      <div className="max-w-lg">
        <div className="grid mb-6">
          <div className="flex flex-col">
            <label className="calc-form-label">Längd:</label>
            <div className="flex">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`calc-form-input-split`}
                min="0"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="calc-form-select-split"
              >
                {Object.keys(units)
                  .map((key) => (
                    <option>{key}</option>
                ))}
              </select>
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
                  {result.data.map((item) => (
                    <p className="text-gray-200">{item.text} ({item.unit}): {item.result}</p>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LengthConverter;