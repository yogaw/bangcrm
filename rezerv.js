// Auth gate: reuse login state from dashboard
(function enforceAuth() {
  const logged =
    localStorage.getItem('bangCRM_loggedIn') === 'true' ||
    sessionStorage.getItem('bangCRM_loggedIn') === 'true';
  if (!logged) {
    window.location.href = 'login.html';
  }
})();

// Utility: get list from localStorage or query param
// Function: getReportFiles
function getReportFiles() {
  // Priority: localStorage set by the "Get Data from Rezerv" flow
  const storage = localStorage.getItem('rezervReportFiles');
  if (storage) {
    try {
      const files = JSON.parse(storage);
      if (Array.isArray(files)) return files;
    } catch (_) {}
  }

  // Fallback: optional query param e.g. ?files=members.csv,transactions.csv
  const params = new URLSearchParams(window.location.search);
  const qp = params.get('files');
  if (qp) {
    return qp.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Default: uploaded filenames
  return [
    'expiringPlans.csv',
    'memberships (1).csv',
    'packages.csv',
    'customer_report_20220911.csv',
    'class_attendance_20251004_to_20251103.csv',
    'daily_transactions_20251030.csv',
    'sales_by_pricing_plan_20251004_to_20251103.csv',
    'attendance-with-revenue_20251004_to_20251103.csv',
    'sales_overtime_20251004_to_20251103.csv',
    'sales_overtime_20251103 (1).csv',
    'customers_activities (1).csv'
  ];
}

// Initialize statuses: default 'available'
function getInitialStatuses(files) {
  const raw = localStorage.getItem('rezervReportStatuses');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const statuses = {};
      files.forEach(f => { statuses[f] = parsed[f] || 'available'; });
      return statuses;
    } catch (_) {}
  }
  return Object.fromEntries(files.map(f => [f, 'available']));
}

// Persist statuses
function saveStatuses(statuses) {
  localStorage.setItem('rezervReportStatuses', JSON.stringify(statuses));
}

// Render list with status badge
function renderList(files, statuses) {
  const listEl = document.getElementById('report-list');
  listEl.innerHTML = '';

  files.forEach(filename => {
    const li = document.createElement('li');
    li.className = 'report-item';

    const meta = document.createElement('div');
    meta.className = 'file-meta';

    const icon = document.createElement('div');
    icon.className = 'file-icon';
    icon.textContent = 'CSV';

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = filename;

    meta.appendChild(icon);
    meta.appendChild(name);

    const state = statuses[filename] || 'available';
    const status = document.createElement('div');
    status.className = `status ${
      state === 'downloaded'
        ? 'status--downloaded'
        : state === 'downloading'
        ? 'status--downloading'
        : 'status--available'
    }`;
    status.innerHTML =
      state === 'downloaded'
        ? '<span class="check">✔</span> Downloaded'
        : state === 'downloading'
        ? 'Downloading…'
        : 'Available';

    li.appendChild(meta);
    li.appendChild(status);
    listEl.appendChild(li);
  });
}

// Progress UI
function updateProgress(completed, total) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = percent + '%';
  if (text) text.textContent = `${percent}% completed`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Sequential mock download: 5 seconds per file
async function mockDownloadSequential(files, statuses) {
  let completed = Object.values(statuses).filter(s => s === 'downloaded').length;
  updateProgress(completed, files.length);

  for (const f of files) {
    if (statuses[f] === 'downloaded') continue;

    // Mark as downloading
    statuses[f] = 'downloading';
    saveStatuses(statuses);
    renderList(files, statuses);

    // Wait 5 seconds
    await sleep(5000);

    // Mark as downloaded
    statuses[f] = 'downloaded';
    saveStatuses(statuses);
    renderList(files, statuses);

    completed++;
    updateProgress(completed, files.length);
  }
}

// Boot and button wiring
document.addEventListener('DOMContentLoaded', () => {
  const files = getReportFiles();
  let statuses = getInitialStatuses(files);

  renderList(files, statuses);

  // Initialize progress from current statuses
  updateProgress(
    Object.values(statuses).filter(s => s === 'downloaded').length,
    files.length
  );

  const btn = document.getElementById('download-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Downloading…';
      await mockDownloadSequential(files, statuses);
      btn.textContent = 'Downloads Completed';
      btn.disabled = false; // re-enable for retry if needed
    });
  }
});