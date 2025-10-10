import { useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const MotorCurrentCalculator = () => {
  const [currentType, setCurrentType] = useState('trefas');
  const [voltage, setVoltage] = useState('');
  const [power, setPower] = useState('');
  const [powerUnit, setPowerUnit] = useState('kW');
  const [efficiency, setEfficiency] = useState('90');
  const [powerFactor, setPowerFactor] = useState('0.85');
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
      { name: 'power', value: power},
      { name: 'efficiency', value: efficiency},
    ];
    if(currentType !== 'lik') {
      fields.push({name: powerFactor, value: powerFactor});
    }

    fields.forEach(({ name, value }) => {
      if (!value || isNaN(value) || parseFloat(value) < 0 ||
          (name === 'powerFactor' && value > 1) || 
          (name === 'efficiency' && value > 100)) {
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

    const v = parseFloat(voltage);
    const p = parseFloat(power);
    const e = parseFloat(efficiency) / 100;
    const pf = parseFloat(powerFactor);
    let c = 0;

    let powerInWatts = 0;
    let powerInVA = 0;
    const isApparentPower = ['VA', 'kVA'].includes(powerUnit);

    if (isApparentPower) {
      powerInVA = powerUnit === 'kVA' ? p * 1000 : p;
    } else {
      if (powerUnit === 'kW') {
        powerInWatts = p * 1000;
      } else if (powerUnit === 'HP') {
        powerInWatts = p * 745.7; // Standardkonvertering för hästkrafter
      } else {
        powerInWatts = p;
      }
    }

    try {
      switch(currentType) {
        case 'trefas':
          if(isApparentPower) {
            c = powerInVA / (Math.sqrt(3) * v);
          } else {
            c = powerInWatts / (Math.sqrt(3) * v * pf * e);
          }
          break;
        case 'enfas':
          if (isApparentPower) {
            c = powerInVA / v;
          } else {
            c = powerInWatts / (v * pf * e);
          }
          break;
        case 'tvåfas':
          if (isApparentPower) {
            c = powerInVA / v;
          } else {
            c = powerInWatts / (v * pf * e);
          }
          break;
        case 'lik':
          if (isApparentPower) {
            c = powerInVA / v;
          } else {
            c = powerInWatts / (v * e);
          }
          break;
      }
      if (isNaN(c) || !isFinite(c) || c < 0) {
        throw new Error("Ogiltigt resultat. Kontrollera dina indata.");
      }
      let resultValue = c.toFixed(2);
      let resultUnit = 'A';

      if (c >= 1000) {
        resultValue = (c / 1000).toFixed(2);
        resultUnit = 'kA';
      }

      setResult({
        value: resultValue,
        unit: resultUnit,
      });

    } catch (error) {
      console.error('Error calculating:', error);
      setResult({ error: "Kunde inte beräkna motorströmmen. Kontrollera dina indata." });
    }
  };

  useKeyboardShortcuts({
    onEnter: calculate,
  });

  return (
    <div className="flex items-center justify-center p-4 bg-[#1c1c1c]">
      <div className="max-w-lg w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col sm:col-span-2">
            <label className="calc-form-label">Typ av ström:</label>
            <div className="flex">
              <select
                value={currentType}
                onChange={handleInputChange(setCurrentType, 'currentType')}
                className="calc-form-select"
              >
                <option value="trefas">Trefas växelström</option>
                <option value="enfas">Enfas växelström</option>
                <option value="tvåfas">Växlande tvåfas</option>
                <option value="lik">Likström</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Effekt:</label>
            <div className="flex">
              <input
                type="number"
                value={power}
                onChange={handleInputChange(setPower, 'power')}
                className={`calc-form-input-split ${errors.current ? 'calc-form-input-error' : ''}`}
                placeholder="Ange effekt"
              />
              <select
                value={powerUnit}
                onChange={(e) => setPowerUnit(e.target.value)}
                className="calc-form-select-split"
              >
                <option value="kW">kW</option>
                <option value="W">W</option>
                <option value="HP">HP</option>
                <option value="kVA">kVA</option>
                <option value="VA">VA</option>
              </select>
            </div>
          </div>
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
          {currentType !== 'lik' &&
            <div className="flex flex-col">
              <label htmlFor="power-factor" className="calc-form-label">Effektfaktor (cos φ):</label>
              <input 
                id="power-factor"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={powerFactor}
                onChange={handleInputChange(setPowerFactor, 'powerFactor')}
                className={`calc-form-input-split ${errors.powerFactor ? 'calc-form-input-error' : ''}`}
              />
            </div>
          }
          <div className="flex flex-col">
            <label htmlFor="efficiency" className="calc-form-label">Verkningsgrad (%):</label>
            <div className="flex">
              <input 
                id="efficiency"
                type="number"
                step="1"
                min="0"
                max="100"
                value={efficiency}
                onChange={handleInputChange(setEfficiency, 'efficiency')}
                className={`calc-form-input-split ${errors.efficiency ? 'calc-form-input-error' : ''}`}
              />
              <span className="calc-form-input-span">%</span>
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
                  <p className="text-gray-200">Beräknad motorström (I): {result.value} {result.unit}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotorCurrentCalculator;