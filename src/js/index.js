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
    this.array = [];
  }

  calculate() {
    const optimal = parseFloat(inputs.optimal.value) || 1;
    const falloff = parseFloat(inputs.falloff.value) || 1;
    const dps = parseFloat(inputs.dps.value) || 0;
    const tracking = parseFloat(inputs.tracking.value) || 1;
    const targetSig = parseFloat(inputs.targetSig.value) || 1;
    const turretSig = parseFloat(inputs.turretSig.value) || 1;
    const angleRad = degreesToRadians(parseFloat(inputs.targetAngle.value) || 0);
    const velocity = parseFloat(inputs.targetVelocity.value) || 0;

    const maxRange = optimal + 2 * falloff;
    this.array = Array.from({ length: Math.ceil((maxRange - 250) / 250) }, (_, i) => {
      const range = 250 + 250 * i;

      const transversal = range * Math.tan(angleRad) * velocity;
      const trackingTerm = Math.pow((transversal / (range * tracking)) * (targetSig / turretSig), 2);
      const falloffTerm = Math.pow(Math.max(0, (range - optimal) / falloff), 2);
      const hitChance = Math.pow(0.5, trackingTerm + falloffTerm);

      // Normalized damage multiplier
      const multiplier = hitChance < 0.01
        ? hitChance * 3
        : 0.5 * Math.min(Math.pow(hitChance, 2) + 0.98 * hitChance + 0.0501, 6 * hitChance);

      return {
        range,
        transversal,
        trackingEQ: trackingTerm,
        rangeEQ: falloffTerm,
        chanceToHit: hitChance,
        multiplier,
        adjustedDPS: dps * multiplier
      };
    });

    return this.array;
  }
}

const matrix = new TurretMatrix();

function updateTable(values) {
  const tbody = document.querySelector('#damage-table tbody');
  tbody.innerHTML = '';

  values.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.range}</td>
      <td>${row.transversal.toFixed(2)}</td>
      <td>${row.trackingEQ.toFixed(4)}</td>
      <td>${row.rangeEQ.toFixed(4)}</td>
      <td>${row.chanceToHit.toFixed(4)}</td>
      <td>${row.multiplier.toFixed(4)}</td>
      <td>${row.adjustedDPS.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  updateChart(values);
}

function updateChart(values) {
  if (window.chart) window.chart.destroy();
  const ctx = document.getElementById('damage-chart').getContext('2d');
  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: values.map(e => e.range),
      datasets: [{
        label: 'Adjusted DPS',
        data: values.map(e => e.adjustedDPS),
        borderColor: 'cyan',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Range (m)' } },
        y: { title: { display: true, text: 'Adjusted DPS' } }
      }
    }
  });
}

function setupEventListeners() {
  Object.values(inputs).forEach(input =>
    input.addEventListener('input', () => updateTable(matrix.calculate()))
  );
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateTable(matrix.calculate());
});
