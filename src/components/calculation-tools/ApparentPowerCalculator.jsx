import { useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const ApparentPowerCalculator = () => {
  const [currentType, setCurrentType] = useState('enfas');
  const [voltage, setVoltage] = useState('');
  const [voltageUnit, setVoltageUnit] = useState('V');
  const [current, setCurrent] = useState('');
  const [currentUnit, setCurrentUnit] = useState('A');
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
      { name: 'current', value: current},
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

    const v = parseFloat(voltage) * (voltageUnit === 'kV' ? 1000 : voltageUnit === 'MV' ? 1000000 : 1);
    const c = parseFloat(current) * (currentUnit === 'mA' ? 0.001 : currentUnit === 'kA' ? 1000 : 1);
    let s;

    try {
      if(currentType === 'lik' || currentType === 'enfas') {
        s = v * c;
      } else if(currentType === 'trefas') {
        s = Math.sqrt(3) * v * c;
      }

      if(isNaN(s) || !isFinite(s) || s < 0) {
        throw new Error("Kunde inte beräkna effekten. Kontrollera dina indata.");
      }

      const s_kva = s / 1000;

      setResult({
        S: s,
        S_kVA: s_kva,
      });
    } catch (error) {
      console.error('Error calculating:', error);
      setResult({ error: "Kunde inte beräkna effekten. Kontrollera dina indata." });
    }
  };

  useKeyboardShortcuts({
    onEnter: calculate,
  });

  return (
    <div className="flex items-center justify-center p-4 bg-[#1c1c1c]">
      <div className="max-w-lg w-full">
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="calc-form-label">Typ av ström:</label>
            <div className="flex">
              <select
                value={currentType}
                onChange={handleInputChange(setCurrentType, 'currentType')}
                className="calc-form-select"
              >
                <option value="enfas">Enfas växelström</option>
                <option value="trefas">Trefas växelström</option>
                <option value="lik">Likström</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Spänning (U):</label>
            <div className="flex">
              <input
                type="number"
                value={voltage}
                onChange={handleInputChange(setVoltage, 'voltage')}
                className={`calc-form-input-split ${errors.voltage ? 'calc-form-input-error' : ''}`}
                placeholder="Ange spänning"
              />
              <select
                value={voltageUnit}
                onChange={(e) => setVoltageUnit(e.target.value)}
                className="calc-form-select-split"
              >
                <option value="V">V</option>
                <option value="kV">kV</option>
                <option value="MV">MV</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Ström (I):</label>
            <div className="flex">
              <input
                type="number"
                value={current}
                onChange={handleInputChange(setCurrent, 'current')}
                className={`calc-form-input-split ${errors.current ? 'calc-form-input-error' : ''}`}
                placeholder="Ange ström"
              />
              <select
                value={currentUnit}
                onChange={(e) => setCurrentUnit(e.target.value)}
                className="calc-form-select-split"
              >
                <option value="A">A</option>
                <option value="mA">mA</option>
                <option value="kA">kA</option>
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
                  <p className="text-gray-200">Beräknad skenbar effekt (S): {result.S.toFixed(2)} VA</p>
                  <p className="text-gray-200">Beräknad skenbar effekt (S): {result.S_kVA.toFixed(2)} kVA</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApparentPowerCalculator;