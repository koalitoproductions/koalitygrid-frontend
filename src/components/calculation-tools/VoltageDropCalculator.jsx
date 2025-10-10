import { useState } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const VoltageDropCalculator = () => {
  const [currentType, setCurrentType] = useState('enfas');
  const [voltage, setVoltage] = useState('');
  const [load, setLoad] = useState('');
  const [loadUnit, setLoadUnit] = useState('W');
  const [powerFactor, setPowerFactor] = useState('0.9');
  const [area, setArea] = useState('0.5');
  const [parallelConductors, setParallelConductors] = useState('1');
  const [lineLength, setLineLength] = useState('');
  const [conductorMaterial, setConductorMaterial] = useState('koppar');
  const [cableType, setCableType] = useState('unipolar');
  const [operatingTemperature, setOperatingTemperature] = useState('70');
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
      { name: 'load', value: load},
      { name: 'area', value: area},
      { name: 'powerFactor', value: powerFactor},
      { name: 'parallelConductors', value: parallelConductors},
      { name: 'lineLength', value: lineLength},
      { name: 'operatingTemperature', value: operatingTemperature},
    ];

    fields.forEach(({ name, value }) => {
      if (!value || isNaN(value) || parseFloat(value) < 0 ||
          (name === 'powerFactor' && value > 1)) {
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
    let l = parseFloat(load);
    const pf = parseFloat(powerFactor);
    const a = parseFloat(area);
    const n = parseInt(parallelConductors);
    const ll = parseFloat(lineLength);
    const temp = parseFloat(operatingTemperature);

    // Konstanter för resistivitet vid 20°C (Ohm * mm²/m)
    const rhoCopper20C = 0.0175;
    const rhoAluminum20C = 0.028;

    // Temperaturkoefficienter (per °C)
    const alphaCopper = 0.00393;
    const alphaAluminum = 0.00403;

    let rhoActual; // Resistivitet vid arbetstemperatur
    let alpha; // Temperaturkoefficient

    if (conductorMaterial === 'koppar') {
        rhoActual = rhoCopper20C;
        alpha = alphaCopper;
    } else { // aluminium
        rhoActual = rhoAluminum20C;
        alpha = alphaAluminum;
    }

    rhoActual = rhoActual * (1 + alpha * (temp - 20));

    // Konvertera lasten till Watt (W) eller Volt-Ampere (VA) för beräkning
    let P_for_current_calc = l; // Denna kommer att vara i W eller VA
    let is_active_power = false; // Flagga för att indikera om det är aktiv effekt (W, kW, MW)

    try {
      switch (loadUnit) {
        case 'W':
          is_active_power = true;
          break;
        case 'kW':
          P_for_current_calc *= 1000; // kW till W
          is_active_power = true;
          break;
        case 'MW':
          P_for_current_calc *= 1000000; // MW till W
          is_active_power = true;
          break;
        case 'VA':
          // Redan i VA
          break;
        case 'kVA':
          P_for_current_calc *= 1000; // kVA till VA
          break;
        case 'MVA':
          P_for_current_calc *= 1000000; // MVA till VA
          break;
      }

      let i;
      if (currentType === 'enfas' || currentType === 'lik') {
          if (is_active_power) {
              // Om lasten är i Watt (aktiv effekt), använd effektfaktorn
              i = P_for_current_calc / (v * pf);
          } else {
              // Om lasten är i VA (skenbar effekt), använd inte effektfaktorn i strömberäkningen
              i = P_for_current_calc / v;
          }
      } else if (currentType === 'trefas') {
          if (is_active_power) {
              // Om lasten är i Watt (aktiv effekt), använd effektfaktorn
              i = P_for_current_calc / (Math.sqrt(3) * v * pf);
          } else {
              // Om lasten är i VA (skenbar effekt), använd inte effektfaktorn i strömberäkningen
              i = P_for_current_calc / (Math.sqrt(3) * v);
          }
      }

      // Beräkna ledningsresistans (R) per fas
      // R = (rho * L) / A
      // Dela med parallella ledare för att få ekvivalent resistans
      const resistancePerConductor = (rhoActual * ll) / a;
      const totalResistance = resistancePerConductor / n;

      // Beräkna spänningsfall (deltaU) i volt
      let deltaU;
      if (currentType === 'enfas' || currentType === 'lik') {
          // För enfas/likström, spänningsfallet är över två ledare (fram och tillbaka)
          // DeltaU = 2 * I * R_total
          deltaU = 2 * i * totalResistance;
      } else if (currentType === 'trefas') {
          // För trefas, spänningsfallet är över en fasledare till neutralpunkt, multiplicerat med sqrt(3) för fas-fas spänningsfall
          // DeltaU = sqrt(3) * I * totalResistance;
          deltaU = Math.sqrt(3) * i * totalResistance;
      }

      // Beräkna spänningsfallet i procent
      const deltaUPercentage = (deltaU / v) * 100;

      setResult({
        current: i.toFixed(2),
        voltageDrop: deltaU.toFixed(2),
        voltageDropPercentage: deltaUPercentage.toFixed(2),
      });

    } catch (error) {
      console.error('Error calculating:', error);
      setResult({ error: "Kunde inte beräkna spänningsfallet. Kontrollera dina indata." });
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
            <label className="calc-form-label">Last:</label>
            <div className="flex">
              <input
                type="number"
                value={load}
                onChange={handleInputChange(setLoad, 'load')}
                className={`calc-form-input-split ${errors.current ? 'calc-form-input-error' : ''}`}
                placeholder="Ange last"
              />
              <select
                value={loadUnit}
                onChange={(e) => setLoadUnit(e.target.value)}
                className="calc-form-select-split"
              >
                <option value="W">W</option>
                <option value="kW">kW</option>
                <option value="kW">MW</option>
                <option value="HP">HP</option>
                <option value="VA">VA</option>
                <option value="kVA">kVA</option>
                <option value="MVA">MVA</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="power-factor" className="calc-form-label">Effektfaktor:</label>
            <input 
              id="power-factor"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={powerFactor}
              onChange={handleInputChange(setPowerFactor, 'powerFactor')}
              className={`calc-form-input ${errors.powerFactor ? 'calc-form-input-error' : ''}`}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="area" className="calc-form-label">Area:</label>
            <div className="flex">
              <input 
                id="area"
                type="number"
                step="0.1"
                value={area}
                onChange={handleInputChange(setArea, 'area')}
                className={`calc-form-input-split ${errors.area ? 'calc-form-input-error' : ''}`}
              />
              <span className="calc-form-input-span">mm²</span>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="parallel-conductors" className="calc-form-label">Fasledare parallellt:</label>
            <input 
              id="parallel-conductors"
              type="number"
              value={parallelConductors}
              onChange={handleInputChange(setParallelConductors, 'parallelConductors')}
              className={`calc-form-input ${errors.parallelConductors ? 'calc-form-input-error' : ''}`}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="line-length" className="calc-form-label">Linjelängd:</label>
            <div className="flex">
              <input 
                id="line-length"
                type="number"
                step="0.1"
                value={lineLength}
                onChange={handleInputChange(setLineLength, 'lineLength')}
                className={`calc-form-input-split ${errors.lineLength ? 'calc-form-input-error' : ''}`}
                placeholder="Ange linjelängd"
              />
              <span className="calc-form-input-span">m</span>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="conductor-material" className="calc-form-label">Ledare:</label>
            <div className="flex">
              <select
                id="conductor-material"
                value={conductorMaterial}
                onChange={handleInputChange(setConductorMaterial, 'conductorMaterial')}
                className="calc-form-select"
              >
                <option value="koppar">Koppar</option>
                <option value="aluminium">Aluminium</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="cable-type" className="calc-form-label">Kabeltyp:</label>
            <div className="flex">
              <select
                id="cable-type"
                value={cableType}
                onChange={handleInputChange(setCableType, 'cableType')}
                className="calc-form-select"
              >
                <option value="unipolar">Unipolar</option>
                <option value="flerledare">Flerledare</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="operating-temperature" className="calc-form-label">Arbetstemperatur:</label>
            <div className="flex">
              <input
                id="operating-temperature"
                type="number"
                value={operatingTemperature}
                onChange={handleInputChange(setOperatingTemperature, 'operatingTemperature')}
                className={`calc-form-input-split ${errors.operatingTemperature ? 'calc-form-input-error' : ''}`}
              />
              <span className="calc-form-input-span">°C</span>
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
                  <p className="text-gray-200">Beräknad ström (I): {result.current} A</p>
                  <p className="text-gray-200">Spänningsfall (ΔU): {result.voltageDrop} V</p>
                  <p className={`${result.voltageDropPercentage > 4 ? 'text-orange-400': 'text-gray-200'}`}>Spänningsfall: {result.voltageDropPercentage} %</p>
                  {result.voltageDropPercentage > 4 &&
                  <p className="text-orange-400 text-sm mt-2">Varning: Spänningsfallet överstiger rekommenderade gränser (vanligen 4%).</p>
                  }
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoltageDropCalculator;