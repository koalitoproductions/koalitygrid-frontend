import { useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

import SingelImage from '../../assets/batteritid_singel.png';
import SerieImage from '../../assets/batteritid_serie.png';
import ParallelltImage from '../../assets/batteritid_parallellt.png';

function BatteryLifeCalculator({ onClose }) {
  const [connection, setConnection] = useState('Singel');
  const [numBatteries, setNumBatteries] = useState(1);
  const [voltage, setVoltage] = useState('');
  const [capacity, setCapacity] = useState('');
  const [capacityUnit, setCapacityUnit] = useState('Ah');
  const [load, setLoad] = useState('');
  const [loadUnit, setLoadUnit] = useState('W');
  const [peukert, setPeukert] = useState('1');
  const [dod, setDod] = useState(100);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const connectionImages = {
    'Singel': SingelImage,
    'I serie': SerieImage,
    'Parallellt': ParallelltImage,
  };

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
      { name: 'capacity', value: capacity },
      { name: 'load', value: load },
      { name: 'peukert', value: peukert },
      { name: 'dod', value: dod },
    ];

    if (connection !== 'Singel') {
      fields.push({ name: 'numBatteries', value: numBatteries });
    }

    fields.forEach(({ name, value }) => {
      if (!value || isNaN(value) || parseFloat(value) < 0) {
        newErrors[name] = true;
      }
      if (name === 'dod' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
        newErrors[name] = true;
      }
      if (name === 'peukert' && (parseFloat(value) < 1 || isNaN(value) || parseFloat(value) > 2)) {
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
      connection,
      numBatteries: parseInt(numBatteries),
      voltage: parseFloat(voltage),
      capacity: parseFloat(capacity),
      capacityUnit,
      load: parseFloat(load),
      loadUnit,
      peukert: parseFloat(peukert),
      dod: parseFloat(dod),
    };

    try {
      let current = load;
      if (loadUnit === 'W') current = load / (data.voltage * (connection === 'I serie' ? numBatteries : 1));
      else if (loadUnit === 'mA') current = load / 1000;
      else if (loadUnit === 'VA') current = load / (data.voltage * (connection === 'I serie' ? numBatteries : 1));
      const capacityAh = capacityUnit === 'kWh' ? (capacity * 1000) / (data.voltage * (connection === 'I serie' ? numBatteries : 1)) : capacity;
      const effectiveCapacity = capacityAh * (connection === 'Parallellt' ? numBatteries : 1) * (dod / 100);
      const hours = 20 * Math.pow(effectiveCapacity / (current * 20), peukert);
      setResult({
        time: hours.toFixed(2),
        totalVoltage: (data.voltage * (connection === 'I serie' ? numBatteries : 1)).toFixed(2),
        totalCapacity: (capacityAh * (connection === 'Parallellt' ? numBatteries : 1)).toFixed(2),
        loadCurrent: current.toFixed(2),
        efficiency: '100%',
      });
    } catch (error) {
      console.error('Error calculating battery life:', error);
      setResult({ error: 'Calculation failed. Please check inputs.' });
    }
  };

  useKeyboardShortcuts({
    onEnter: calculate,
  });

  return (
    <div className="rounded-lg flex items-center justify-center p-4 bg-[#1c1c1c]">
      <div className="max-w-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="calc-form-label">Anslutning:</label>
            <select
              value={connection}
              onChange={(e) => setConnection(e.target.value)}
              className="calc-form-select"
            >
              <option>Singel</option>
              <option>I serie</option>
              <option>Parallellt</option>
            </select>
          </div>
          {
            connection !== 'Singel' &&
            <div className="flex flex-col">
              <label className="calc-form-label">Antal batterier:</label>
              <input
                type="number"
                value={numBatteries}
                onChange={handleInputChange(setNumBatteries, 'numBatteries')}
                disabled={connection === 'Singel'}
                className={`calc-form-input ${errors.numBatteries ? 'calc-form-input-error' : ''}`}
                min="1"
              />
            </div>
          }
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
          <div className="flex flex-col">
            <label className="calc-form-label">Kapacitet:</label>
            <div className="flex">
              <input
                type="number"
                value={capacity}
                onChange={handleInputChange(setCapacity, 'capacity')}
                className={`calc-form-input-split ${errors.capacity ? 'calc-form-input-error' : ''}`}
                placeholder="Ange kapacitet"
              />
              <select
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value)}
                className="calc-form-select-split"
              >
                <option>Ah</option>
                <option>kWh</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Last:</label>
            <div className="flex">
              <input
                type="number"
                value={load}
                onChange={handleInputChange(setLoad, 'load')}
                className={`calc-form-input-split ${errors.load ? 'calc-form-input-error' : ''}`}
                placeholder="Ange last"
              />
              <select
                value={loadUnit}
                onChange={(e) => setLoadUnit(e.target.value)}
                className="calc-form-select-split"
              >
                <option>W</option>
                <option>A</option>
                <option>mA</option>
                <option>VA</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Peukerts koefficient:</label>
            <input
              type="number"
              value={peukert}
              onChange={handleInputChange(setPeukert, 'peukert')}
              className={`calc-form-input ${errors.peukert ? 'calc-form-input-error' : ''}`}
              min="1"
              max="2"
              step="0.1"
              placeholder="Ange Peukerts koefficient"
            />
          </div>
          <div className="flex flex-col">
            <label className="calc-form-label">Djup för Utflöde (DOD):</label>
            <div className="flex">
              <input
                type="number"
                value={dod}
                onChange={handleInputChange(setDod, 'dod')}
                className={`calc-form-input-split ${errors.dod ? 'calc-form-input-error' : ''}`}
                min="0"
                max="100"
                placeholder="Ange DOD"
              />
              <span className="calc-form-input-span">%</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <img src={connectionImages[connection]} alt={`${connection}`} className="rounded-lg shadow-md" />
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
                  <p className="text-gray-200">Batteritid: {result.time} timmar</p>
                  <p className="text-gray-200">Total spänning: {result.totalVoltage} V</p>
                  <p className="text-gray-200">Total kapacitet: {result.totalCapacity} Ah</p>
                  <p className="text-gray-200">Lastström: {result.loadCurrent} A</p>
                  <p className="text-gray-200">Verkningsgrad: {result.efficiency}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BatteryLifeCalculator;