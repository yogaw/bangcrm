// Expiring Plans Data Management
document.addEventListener('DOMContentLoaded', function() {
  loadExpiringPlans();
  setupDownloadButtons();
});

// Setup download buttons
function setupDownloadButtons() {
  document.getElementById('download-csv').addEventListener('click', downloadCSV);
  document.getElementById('download-excel').addEventListener('click', downloadExcel);
}

// Function to generate filtered CSV
function generateFilteredCSV() {
  const csvText = localStorage.getItem('expiringPlansCSV');
  if (!csvText) return '';

  const plans = parseExpiringCSV(csvText);

  // Filter out specific plan types (EXCLUDE these)
  const filteredPlans = plans.filter(plan => {
    const planName = (plan['Plan Name'] || '').toLowerCase();
    const excludedPlans = ['drop in', '1 free class pass', 'drop in (20% off)', '10 free pass (instructor)'];
    return !excludedPlans.some(excluded => planName.includes(excluded));
  });

  // Generate CSV with filtered data
  const headers = 'Type,Plan Name,Total Credits,Remaining Credits,Purchased Date,Start Date,End Date,First Name,Last Name,Mobile,Email,First Class,Last Class,Last Class Staff,Last Class Name';
  const rows = filteredPlans.map(plan => {
    return [
      plan['Type'] || '',
      plan['Plan Name'] || '',
      plan['Total Credits'] || '',
      plan['Remaining Credits'] || '',
      plan['Purchased Date'] || '',
      plan['Start Date'] || '',
      plan['End Date'] || '',
      plan['First Name'] || '',
      plan['Last Name'] || '',
      plan['Mobile'] || '',
      plan['Email'] || '',
      plan['First Class'] || '',
      plan['Last Class'] || '',
      plan['Last Class Staff'] || '',
      plan['Last Class Name'] || ''
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

// Download CSV function
async function downloadCSV() {
  try {
    showNotification('Preparing CSV download...', 'info');

    // Generate filtered CSV data
    const csvText = generateFilteredCSV();

    if (!csvText) {
      throw new Error('No data available for download');
    }

    // Create and download file
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'expiring_plans_' + new Date().toISOString().split('T')[0] + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('CSV file downloaded successfully!', 'success');
  } catch (error) {
    console.error('Error downloading CSV:', error);
    showNotification('Error downloading CSV file: ' + error.message, 'error');
  }
}

// Download Excel function
async function downloadExcel() {
  try {
    showNotification('Preparing Excel download...', 'info');

    // Generate filtered CSV data
    const csvText = generateFilteredCSV();

    if (!csvText) {
      throw new Error('No data available for download');
    }

    // Create Excel-compatible format
    const excelContent = convertCSVToExcel(csvText);

    // Create and download file
    const blob = new Blob([excelContent], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'expiring_plans_' + new Date().toISOString().split('T')[0] + '.xls');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Excel file downloaded successfully!', 'success');
  } catch (error) {
    console.error('Error downloading Excel:', error);
    showNotification('Error downloading Excel file: ' + error.message, 'error');
  }
}

// Convert CSV to Excel-compatible format
function convertCSVToExcel(csvText) {
  // Add Excel BOM for proper UTF-8 encoding in Excel
  const bom = '\uFEFF';

  // Process CSV to ensure Excel compatibility
  let processedCSV = csvText;

  // Ensure proper line endings for Excel
  processedCSV = processedCSV.replace(/\r\n/g, '\n');
  processedCSV = processedCSV.replace(/\r/g, '\n');

  // Add proper Excel table formatting
  const lines = processedCSV.split('\n');
  if (lines.length > 0) {
    // Clean up each line
    const processedLines = lines.map(line => {
      // Remove any problematic characters and ensure proper CSV formatting
      return line.replace(/[^\x20-\x7E\u00A0-\u00FF\u4E00-\u9FFF,\n]/g, '');
    });

    processedCSV = processedLines.join('\n');
  }

  return bom + processedCSV;
}

// Show notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #17a2b8 0%, #007bff 100%)';
  }

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

async function loadExpiringPlans() {
  const tbody = document.getElementById('expiring-table-body');

  try {
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="5" class="loading-placeholder">Loading expiring plans data...</td></tr>';

    // Embedded CSV data with actual membership packages (excluding drop-ins and free passes)
    const csvText = `Type,Plan Name,Total Credits,Remaining Credits,Purchased Date,Start Date,End Date,First Name,Last Name,Mobile,Email,First Class,Last Class,Last Class Staff,Last Class Name
Package,KEEP THE PARTY GOING💃🏻 (10 Pack),10,0,09/09/25,27/09/25,26/11/25,Arlene,Tjahja,+62 818785005,jemima.tjahja@gmail.com,19/09/25,16/10/25,"Surya Mallarangeng, Fellix Guy Kitto",BANG!
Package,3 Class Starter Pack,3,1,15/11/25,15/11/25,28/11/25,Wanti,Kadarisma,+62 87713111970,wantikadarisman@rocketmail.com,15/11/25,23/11/25,Elvira Wijaya,BANG!
Package,5 Class Pack (30% off),5,2,27/09/25,02/11/25,01/12/25,Theo,Tedjasasmita,+62 87889885152,ttedjasasmita@gmail.com,02/11/25,23/11/25,Elvira Wijaya,BANG!
Package,5 Class Pack (30% off),5,2,31/10/25,02/11/25,01/12/25,Clairine,Runtung,+62 8111576901,runtung.clairine@gmail.com,02/11/25,22/11/25,"Syed Harris, Chamonique Garnita",BANG!
Package,10 Class Pack (30% off),10,3,26/09/25,02/10/25,01/12/25,rachel,lie,+62 81110076622,racheljoannelie.sli@gmail.com,02/10/25,27/11/25,Surya Mallarangeng,BANG!
Package,10 Class Pack (30% off),10,3,27/09/25,01/10/25,30/11/25,Nadia,Hudyana,+62 81285001666,nadiave.design@gmail.com,01/10/25,30/11/25,TBC (To Be Confirmed),BANG!
Package,KEEP THE PARTY GOING💃🏻 (10 Pack),10,8,09/09/25,27/09/25,26/11/25,guntur,mallarangeng,+62 8111888764,gunturmallarangeng@gmail.com,27/09/25,27/09/25,"Ruth Ivannie, Surya Mallarangeng",BANG!
Package,10 Class Pack (30% off),10,9,26/09/25,27/09/25,26/11/25,Nabila,Rudiono,"+62 ",nabila.rudiono@gmail.com,27/09/25,27/09/25,"Nabau (Nabila Audri), Elvira Wijaya",BANG!`;

    // Also store for download functions
    localStorage.setItem('expiringPlansCSV', csvText);

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    // Parse CSV data
    const plans = parseExpiringCSV(csvText);

    if (!plans || plans.length === 0) {
      throw new Error('No valid data found in CSV file');
    }

    // Hide loading state
    tbody.innerHTML = '';

    // Update summary cards
    updateExpiringSummaryCards(plans);

    // Populate the table
    populateExpiringTable(plans);

    console.log('Successfully loaded', plans.length, 'expiring plans');

  } catch (error) {
    console.error('Error loading expiring plans:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-placeholder" style="color: #dc3545;">
          <strong>Error loading data:</strong> ${error.message}
          <br>
          <small>Please ensure the CSV file exists and is properly formatted.</small>
        </td>
      </tr>
    `;
  }
}

function parseExpiringCSV(csvText) {
  // Split lines and filter empty ones
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse headers
  const headers = lines[0].split(',').map(header => header.trim());
  console.log('CSV Headers:', headers);

  const plans = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      // Handle quoted values in CSV
      const values = parseCSVLine(lines[i]);
      const plan = {};

      headers.forEach((header, index) => {
        plan[header] = values[index] || '';
      });

      // Calculate days until expiry
      const endDate = plan['End Date'];
      if (endDate) {
        plan['Days Until Expiry'] = calculateDaysUntilExpiry(endDate);
      }

      // Combine first and last name
      const firstName = plan['First Name'] || '';
      const lastName = plan['Last Name'] || '';
      plan['Full Name'] = `${firstName} ${lastName}`.trim();

      // Convert numeric fields with better error handling
      const numericFields = ['Total Credits', 'Remaining Credits'];
      numericFields.forEach(field => {
        if (plan[field]) {
          const parsed = parseFloat(plan[field]);
          plan[field] = isNaN(parsed) ? 0 : parsed;
        } else {
          plan[field] = 0;
        }
      });

      plans.push(plan);
    }
  }

  console.log('Parsed plans:', plans.length);
  return plans;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

function calculateDaysUntilExpiry(endDateStr) {
  try {
    // Parse date format (DD/MM/YY or DD/MM/YYYY)
    const parts = endDateStr.split('/');
    if (parts.length !== 3) return null;

    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]);
    let year = parseInt(parts[2]);

    // Handle 2-digit year
    if (year < 100) {
      year += 2000;
    }

    const endDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Error parsing date:', endDateStr, error);
    return null;
  }
}

function updateExpiringSummaryCards(plans) {
  // Filter out specific plan types (EXCLUDE these)
  const filteredPlans = plans.filter(plan => {
    const planName = (plan['Plan Name'] || '').toLowerCase();
    const excludedPlans = ['drop in', '1 free class pass', 'drop in (20% off)', '10 free pass (instructor)'];
    return !excludedPlans.some(excluded => planName.includes(excluded));
  });

  const totalPlans = filteredPlans.length;

  // Count critical plans (7 days or less)
  const criticalPlans = filteredPlans.filter(p => {
    const days = p['Days Until Expiry'];
    return days !== null && days <= 7 && days >= 0;
  }).length;

  // Calculate average days to expiry
  const validDays = filteredPlans
    .map(p => p['Days Until Expiry'])
    .filter(days => days !== null && days >= 0);
  const avgDays = validDays.length > 0
    ? Math.round(validDays.reduce((sum, days) => sum + days, 0) / validDays.length)
    : 0;

  document.getElementById('total-plans').textContent = totalPlans;
  document.getElementById('critical-plans').textContent = criticalPlans;
  document.getElementById('avg-days').textContent = avgDays;
}

function populateExpiringTable(plans) {
  const tbody = document.getElementById('expiring-table-body');
  tbody.innerHTML = '';

  // Filter out specific plan types (EXCLUDE these)
  const filteredPlans = plans.filter(plan => {
    const planName = (plan['Plan Name'] || '').toLowerCase();
    const excludedPlans = ['drop in', '1 free class pass', 'drop in (20% off)', '10 free pass (instructor)'];
    return !excludedPlans.some(excluded => planName.includes(excluded));
  });

  // Sort by days until expiry (ascending - soonest first)
  filteredPlans.sort((a, b) => {
    const daysA = a['Days Until Expiry'];
    const daysB = b['Days Until Expiry'];

    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1;
    if (daysB === null) return -1;

    return daysA - daysB;
  });

  filteredPlans.forEach(plan => {
    const row = document.createElement('tr');

    const daysUntil = plan['Days Until Expiry'];
    let rowClass = '';

    if (daysUntil !== null) {
      if (daysUntil <= 7 && daysUntil >= 0) {
        rowClass = 'alert-critical';
      } else if (daysUntil <= 30 && daysUntil > 7) {
        rowClass = 'alert-warning';
      } else if (daysUntil > 30) {
        rowClass = 'alert-safe';
      }
    }

    row.innerHTML = `
      <td>${plan['Full Name'] || 'N/A'}</td>
      <td>${plan['End Date'] || ''}</td>
      <td class="${rowClass}">${daysUntil !== null ? daysUntil : 'N/A'}</td>
      <td>${plan['Remaining Credits']}</td>
      <td>${plan['Plan Name'] || ''}</td>
    `;

    tbody.appendChild(row);
  });
}