import { useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const CurrentCalculator = () => {
  const [currentType, setCurrentType] = useState('enfas');
  const [calculationType, setCalculationType] = useState('voltage_power');
  const [voltage, setVoltage] = useState('');
  const [voltageUnit, setVoltageUnit] = useState('V');
  const [power, setPower] = useState('');
  const [powerUnit, setPowerUnit] = useState('W');
  const [powerFactorType, setPowerFactorType] = useState('cos_phi');
  const [powerFactorValue, setPowerFactorValue] = useState('0.9');
  const [impedance, setImpedance] = useState('');
  const [resistance, setResistance] = useState('');
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
    const fields = [];

    if (['voltage_power', 'power_impedance'].includes(calculationType)) {
      fields.push({ name: 'power', value: power});
    }
    if (['voltage_power', 'voltage_impedance', 'voltage_resistance'].includes(calculationType)) {
      fields.push({ name: 'voltage', value: voltage });
    }
    if (['voltage_impedance', 'power_impedance'].includes(calculationType)) {
      fields.push({ name: 'impedance', value: impedance });
    }
    if (['voltage_resistance', 'power_resistance'].includes(calculationType)) {
      fields.push({ name: 'resistance', value: resistance });
    }
    if (['voltage_power', 'power_impedance'].includes(calculationType) && currentType !== 'lik') {
      fields.push({ name: 'powerFactorValue', value: powerFactorValue });
    }

    fields.forEach(({ name, value }) => {
      if (!value || isNaN(value) || parseFloat(value) < 0) {
        newErrors[name] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validateInputs()) {
      setResult({ error: 'Vänligen fyll i alla fält med giltiga siffror.' });
      return;
    }

    const v = parseFloat(voltage) * (voltageUnit === 'kV' ? 1000 : 1);
    const p = parseFloat(power) * (powerUnit === 'kW' ? 1000 : powerUnit === 'MW' ? 1000000 : powerUnit === 'kVA' ? 1000 : powerUnit === 'MVA' ? 1000000 : 1);
    const pf = parseFloat(powerFactorValue) || 1; // Default to 1 if not provided
    const z = parseFloat(impedance) || 0;
    const r = parseFloat(resistance) || 0;

    let current = 0;
    try {
      if (calculationType === 'voltage_power') {
        if (currentType === 'enfas' || currentType === 'lik') {
          current = p / (v * pf);
        } else if (currentType === 'trefas') {
          current = p / (Math.sqrt(3) * v * pf);
        }
      } else if (calculationType === 'voltage_impedance') {
        current = v / z;
      } else if (calculationType === 'voltage_resistance') {
        current = v / r;
      } else if (calculationType === 'power_impedance') {
        if (currentType === 'enfas' || currentType === 'lik') {
          current = Math.sqrt(p / (z * pf));
        } else if (currentType === 'trefas') {
          current = Math.sqrt(p / (Math.sqrt(3) * z * pf));
        }
      } else if (calculationType === 'power_resistance') {
        if (currentType === 'enfas' || currentType === 'lik') {
          current = Math.sqrt(p / r);
        } else if (currentType === 'trefas') {
          current = Math.sqrt(p / (Math.sqrt(3) * r));
        }
      }
      setResult({ current: current.toFixed(2) });
    } catch (error) {
      console.error('Error calculating current:', error);
      setResult({ error: 'Beräkningen misslyckades. Kolla dina värden.' });
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
            <label className="calc-form-label">Typ av ström:</label>
            <div className="flex">
              <select
                value={currentType}
                onChange={(e) => setCurrentType(e.target.value)}
                className="calc-form-select"
              >
                <option value="enfas">Enfas växelström</option>
                <option value="trefas">Trefas växelström</option>
                <option value="lik">Likström</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Typ av beräkning:</label>
            <select
              value={calculationType}
              onChange={(e) => setCalculationType(e.target.value)}
              className="calc-form-select"
            >
              <option value="voltage_power">Spänning / Effekt</option>
              <option value="voltage_impedance">Spänning / Impedans</option>
              <option value="voltage_resistance">Spänning / Resistans</option>
              <option value="power_impedance">Effekt / Impedans</option>
              <option value="power_resistance">Effekt / Resistans</option>
            </select>
          </div>
          { 
            ['voltage_power', 'voltage_impedance', 'voltage_resistance'].includes(calculationType) &&
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
                <select
                  value={voltageUnit}
                  onChange={(e) => setVoltageUnit(e.target.value)}
                  className="calc-form-select-split"
                >
                  <option>V</option>
                  <option>kV</option>
                </select>
              </div>
            </div>
          }
          {
            ['power_impedance', 'power_resistance', 'voltage_power'].includes(calculationType) &&
            <div className="flex flex-col">
              <label className="calc-form-label">Effekt:</label>
              <div className="flex">
                <input
                  type="number"
                  value={power}
                  onChange={handleInputChange(setPower, 'power')}
                  className={`calc-form-input-split ${errors.power ? 'calc-form-input-error' : ''}`}
                  placeholder="Ange effekt"
                />
                <select
                  value={powerUnit}
                  onChange={(e) => setPowerUnit(e.target.value)}
                  className="calc-form-select-split"
                >
                  <option>W</option>
                  <option>kW</option>
                  <option>MW</option>
                  <option>VA</option>
                  <option>kVA</option>
                  <option>MVA</option>
                </select>
              </div>
            </div>
          }
          {
            ['voltage_power', 'power_impedance'].includes(calculationType) &&
            currentType !== 'lik' &&
            <div className="flex flex-col">
              <label className="calc-form-label">Effektfaktor / Vinkel:</label>
              <div className="flex">
                <input
                  type="number"
                  value={powerFactorValue}
                  onChange={handleInputChange(setPowerFactorValue, 'powerFactorValue')}
                  className={`calc-form-input-split ${errors.powerFactorValue ? 'calc-form-input-error' : ''}`}
                  placeholder="Ange värde"
                />
                <select
                  value={powerFactorType}
                  onChange={(e) => setPowerFactorType(e.target.value)}
                  className="calc-form-select-split"
                >
                  <option value="cos_phi">Cos φ</option>
                  <option value="sin_phi">Sin φ</option>
                  <option value="tan_phi">Tan φ</option>
                  <option value="phi_rad">φ (RAD)</option>
                  <option value="phi_deg">φ (DEG)</option>
                </select>
              </div>
            </div>
          }

          { ['voltage_impedance', 'power_impedance'].includes(calculationType) && 
            <div className="flex flex-col">
              <label className="calc-form-label">Impedans:</label>
              <div className="flex">
                <input
                  type="number"
                  value={impedance}
                  onChange={handleInputChange(setImpedance, 'impedance')}
                  className={`calc-form-input-split ${errors.impedance ? 'calc-form-input-error' : ''}`}
                  placeholder="Ange impedans"
                />
                <span className="calc-form-input-span">Ω</span>
              </div>
            </div>
          }
          { ['voltage_resistance', 'power_resistance'].includes(calculationType) && 
            <div className="flex flex-col">
            <label className="calc-form-label">Resistans:</label>
              <div className="flex">
                <input
                  type="number"
                  value={resistance}
                  onChange={handleInputChange(setResistance, 'resistance')}
                  className={`calc-form-input-split ${errors.resistance ? 'calc-form-input-error' : ''}`}
                  placeholder="Ange resistans"
                />
                <span className="calc-form-input-span">Ω</span>
              </div>
            </div>
          }

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
                  <p className="text-gray-200">Beräknad ström (I): {result.current} A</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrentCalculator;