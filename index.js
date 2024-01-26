// index.js

import './src/js/bs.js';
import './src/js/themeToggle.js';
import './src/js/updateTable.js';
import './src/js/validateForm.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/Halfmoon/2.0.1/css/halfmoon.min.css';
import 'https://cdn.jsdelivr.net/npm/halfmoon@2.0.1/css/cores/halfmoon.modern.css';


const degreesToRadians = (degrees) => degrees * Math.PI / 180;

const inputs = {
  optimal: document.getElementById('optimal'),
  falloff: document.getElementById('falloff'),
  dps: document.getElementById('damage'),
  tracking: document.getElementById('tracking'),
  targetSig: document.getElementById('target-sig'),
  turretSig: document.getElementById('turret-sig'),
  targetAngle: document.getElementById('target-angle'),
  targetVelocity: document.getElementById('target-velocity')
};

class TurretMatrix {
  constructor() {
    this.array = Array.from({ length: 40 }, (_, i) => ({ range: 500 * i }));
    console.log(this.array);
  }

  calculate() {
    return this.array.map((e, i) => {
      e.transversal = e.range * Math.tan(degreesToRadians(inputs.targetAngle.value) * inputs.targetVelocity.value);
      e.trackingEQ = Math.pow(e.transversal / (e.range * inputs.tracking.value) * (inputs.targetSig.value / inputs.turretSig.value), 2);
      e.rangeEQ = Math.pow((Math.max(0, e.range / inputs.optimal.value)), 2);
      e.chanceToHit = Math.pow(0.5, e.trackingEQ + e.rangeEQ);
      e.multiplier = (e.chanceToHit > 0.01) ? Math.pow(e.chanceToHit, 2) + e.chanceToHit + 0.0499 : e.chanceToHit * 3;
      e.averageDPS = e.multiplier * inputs.dps.value;

      return e;
    });
  }
}

function setupEventListeners() {
  inputs.optimal.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.falloff.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.dps.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.tracking.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.targetSig.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.turretSig.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.targetAngle.addEventListener('input', () => updateTable(matrix.calculate()));
  inputs.targetVelocity.addEventListener('input', () => updateTable(matrix.calculate()));
}

function updateTable(values) {
  const table = document.getElementById('damage-table');
  const tbody = table.querySelector('tbody');
  const rows = tbody.getElementsByTagName('tr');
  
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    
    for (let j = 0; j < cells.length; j++) {
      cells[j].textContent = values[i][j];
    }
  }
}


