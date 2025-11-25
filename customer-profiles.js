// Customer Profiles Data Management
document.addEventListener('DOMContentLoaded', function() {
  loadCustomerProfiles();
  setupDownloadButtons();
});

// Setup download buttons
function setupDownloadButtons() {
  document.getElementById('download-csv').addEventListener('click', downloadCSV);
  document.getElementById('download-excel').addEventListener('click', downloadExcel);
}

// Download CSV function
async function downloadCSV() {
  try {
    showNotification('Preparing CSV download...', 'info');

    // Use embedded data to avoid fetch issues
    let csvText = localStorage.getItem('customerProfilesCSV');
    if (!csvText) {
      // Fallback embedded data
      csvText = `CustomerName,MobileCode,Mobile,Email,DateOfBirth,JoinedDate,Completed,Cancelled,Date joined,Days since last class,Days since package purchase,Days since membership purchase,Profile Total Spent,Profile Total Attended,Average Revenue
Tri Wulandari,62.0,811709799.0,wulandari1995.tw@gmail.com,,04/11/24 10:22,75,25,,,,,17947750.0,75,239303.33
Jonathan Edward,62.0,87878461661.0,jonathanedwardtobing98@gmail.com,12 Nov 1998,08/09/24 09:26,2,1,08 Sep 2024,380.0,258.0,,515000.0,2,257500.0
Lingkan S,62.0,81287561090.0,lsngantung@gmail.com,16 Nov 1985,20/08/24 14:58,11,1,20 Aug 2024,10.0,290.0,,1545000.0,11,140454.55
Helena S,62.0,8119187117.0,helenafelicea@yahoo.com,,20/08/24 14:52,174,137,20 Aug 2024,4.0,87.0,28.0,23952650.0,174,137658.91
Lucky Suryadi,62.0,87886678158.0,Luckysuryadi@gmail.com,16 Nov 1989,06/08/24 23:07,62,7,06 Aug 2024,27.0,42.0,,0.0,0,0.0
guntur mallarangeng,62.0,8111888764.0,gunturmallarangeng@gmail.com,14 Feb 1993,02/08/24 16:19,76,10,02 Aug 2024,59.0,77.0,,15656000.0,76,206000.0
Angie Giovanni,62.0,8111592727.0,angie.giovanni2@gmail.com,27 Jul 1993,29/07/24 20:53,27,3,29 Jul 2024,10.0,50.0,,6651225.0,27,246341.67
Randy ,,81224424542.0,r.prasidha@yahoo.com,,26/07/24 10:18,76,27,26 Jul 2024,14.0,59.0,,13160825.0,76,173168.75
,62.0,8111747788.0,elvirakwijaya@gmail.com,,17/07/24 13:42,41,12,17 Jul 2024,2.0,4.0,,1339000.0,41,32658.54`;
    }

    // Create and download file
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customer_profiles_' + new Date().toISOString().split('T')[0] + '.csv');
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

    // Use embedded data to avoid fetch issues
    let csvText = localStorage.getItem('customerProfilesCSV');
    if (!csvText) {
      // Fallback embedded data
      csvText = `CustomerName,MobileCode,Mobile,Email,DateOfBirth,JoinedDate,Completed,Cancelled,Date joined,Days since last class,Days since package purchase,Days since membership purchase,Profile Total Spent,Profile Total Attended,Average Revenue
Tri Wulandari,62.0,811709799.0,wulandari1995.tw@gmail.com,,04/11/24 10:22,75,25,,,,,17947750.0,75,239303.33
Jonathan Edward,62.0,87878461661.0,jonathanedwardtobing98@gmail.com,12 Nov 1998,08/09/24 09:26,2,1,08 Sep 2024,380.0,258.0,,515000.0,2,257500.0
Lingkan S,62.0,81287561090.0,lsngantung@gmail.com,16 Nov 1985,20/08/24 14:58,11,1,20 Aug 2024,10.0,290.0,,1545000.0,11,140454.55
Helena S,62.0,8119187117.0,helenafelicea@yahoo.com,,20/08/24 14:52,174,137,20 Aug 2024,4.0,87.0,28.0,23952650.0,174,137658.91
Lucky Suryadi,62.0,87886678158.0,Luckysuryadi@gmail.com,16 Nov 1989,06/08/24 23:07,62,7,06 Aug 2024,27.0,42.0,,0.0,0,0.0
guntur mallarangeng,62.0,8111888764.0,gunturmallarangeng@gmail.com,14 Feb 1993,02/08/24 16:19,76,10,02 Aug 2024,59.0,77.0,,15656000.0,76,206000.0
Angie Giovanni,62.0,8111592727.0,angie.giovanni2@gmail.com,27 Jul 1993,29/07/24 20:53,27,3,29 Jul 2024,10.0,50.0,,6651225.0,27,246341.67
Randy ,,81224424542.0,r.prasidha@yahoo.com,,26/07/24 10:18,76,27,26 Jul 2024,14.0,59.0,,13160825.0,76,173168.75
,62.0,8111747788.0,elvirakwijaya@gmail.com,,17/07/24 13:42,41,12,17 Jul 2024,2.0,4.0,,1339000.0,41,32658.54`;
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
    link.setAttribute('download', 'customer_profiles_' + new Date().toISOString().split('T')[0] + '.xls');
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

async function loadCustomerProfiles() {
  const tbody = document.getElementById('profiles-table-body');

  try {
    // Show loading state
    tbody.innerHTML = '<tr><td colspan="7" class="loading-placeholder">Loading customer profiles data...</td></tr>';

    // Embedded CSV data to avoid fetch issues
    const csvText = `CustomerName,MobileCode,Mobile,Email,DateOfBirth,JoinedDate,Completed,Cancelled,Date joined,Days since last class,Days since package purchase,Days since membership purchase,Profile Total Spent,Profile Total Attended,Average Revenue
Tri Wulandari,62.0,811709799.0,wulandari1995.tw@gmail.com,,04/11/24 10:22,75,25,,,,,17947750.0,75,239303.33
Jonathan Edward,62.0,87878461661.0,jonathanedwardtobing98@gmail.com,12 Nov 1998,08/09/24 09:26,2,1,08 Sep 2024,380.0,258.0,,515000.0,2,257500.0
Lingkan S,62.0,81287561090.0,lsngantung@gmail.com,16 Nov 1985,20/08/24 14:58,11,1,20 Aug 2024,10.0,290.0,,1545000.0,11,140454.55
Helena S,62.0,8119187117.0,helenafelicea@yahoo.com,,20/08/24 14:52,174,137,20 Aug 2024,4.0,87.0,28.0,23952650.0,174,137658.91
Lucky Suryadi,62.0,87886678158.0,Luckysuryadi@gmail.com,16 Nov 1989,06/08/24 23:07,62,7,06 Aug 2024,27.0,42.0,,0.0,0,0.0
guntur mallarangeng,62.0,8111888764.0,gunturmallarangeng@gmail.com,14 Feb 1993,02/08/24 16:19,76,10,02 Aug 2024,59.0,77.0,,15656000.0,76,206000.0
Angie Giovanni,62.0,8111592727.0,angie.giovanni2@gmail.com,27 Jul 1993,29/07/24 20:53,27,3,29 Jul 2024,10.0,50.0,,6651225.0,27,246341.67
Randy ,,81224424542.0,r.prasidha@yahoo.com,,26/07/24 10:18,76,27,26 Jul 2024,14.0,59.0,,13160825.0,76,173168.75
,62.0,8111747788.0,elvirakwijaya@gmail.com,,17/07/24 13:42,41,12,17 Jul 2024,2.0,4.0,,1339000.0,41,32658.54`;

    // Also store for download functions
    localStorage.setItem('customerProfilesCSV', csvText);

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    // Store CSV data for downloads
    localStorage.setItem('customerProfilesCSV', csvText);

    // Parse CSV data
    const profiles = parseCSV(csvText);

    if (!profiles || profiles.length === 0) {
      throw new Error('No valid data found in CSV file');
    }

    // Hide loading state
    tbody.innerHTML = '';

    // Update summary cards
    updateSummaryCards(profiles);

    // Populate the table
    populateProfilesTable(profiles);

    console.log('Successfully loaded', profiles.length, 'customer profiles');

  } catch (error) {
    console.error('Error loading customer profiles:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="loading-placeholder" style="color: #dc3545;">
          <strong>Error loading data:</strong> ${error.message}
          <br>
          <small>Please ensure the CSV file exists and is properly formatted.</small>
        </td>
      </tr>
    `;
  }
}

function parseCSV(csvText) {
  // Split lines and filter empty ones
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse headers
  const headers = lines[0].split(',').map(header => header.trim());
  console.log('CSV Headers:', headers);

  const profiles = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      // Handle quoted values in CSV
      const values = parseCSVLine(lines[i]);
      const profile = {};

      headers.forEach((header, index) => {
        profile[header] = values[index] || '';
      });

      // Convert numeric fields with better error handling
      const numericFields = ['Profile Total Spent', 'Profile Total Attended', 'Average Revenue', 'Completed', 'Cancelled'];
      numericFields.forEach(field => {
        if (profile[field]) {
          const parsed = parseFloat(profile[field]);
          profile[field] = isNaN(parsed) ? 0 : parsed;
        } else {
          profile[field] = 0;
        }
      });

      profiles.push(profile);
    }
  }

  console.log('Parsed profiles:', profiles.length);
  return profiles;
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

function updateSummaryCards(profiles) {
  const totalCustomers = profiles.length;
  const totalRevenue = profiles.reduce((sum, p) => sum + p['Profile Total Spent'], 0);
  const avgRevenuePerCustomer = totalRevenue / totalCustomers;

  const totalAttended = profiles.reduce((sum, p) => sum + p['Profile Total Attended'], 0);
  const avgRevenuePerClass = totalAttended > 0 ? totalRevenue / totalAttended : 0;

  document.getElementById('total-customers').textContent = totalCustomers;
  document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('avg-revenue').textContent = formatCurrency(avgRevenuePerCustomer);
  document.getElementById('avg-revenue-class').textContent = formatCurrency(avgRevenuePerClass);
}

function populateProfilesTable(profiles) {
  const tbody = document.getElementById('profiles-table-body');
  tbody.innerHTML = '';

  // Sort by total revenue (highest first)
  profiles.sort((a, b) => b['Profile Total Spent'] - a['Profile Total Spent']);

  profiles.forEach(profile => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${profile.CustomerName || ''}</td>
      <td>${profile.MobileCode || ''}</td>
      <td>${profile.Mobile || ''}</td>
      <td>${profile.Email || ''}</td>
      <td>${profile.DateOfBirth || ''}</td>
      <td>${profile.JoinedDate || ''}</td>
      <td>${profile.Completed || ''}</td>
      <td>${profile.Cancelled || ''}</td>
      <td>${profile['Date joined'] || ''}</td>
      <td>${profile['Days since last class'] || ''}</td>
      <td>${profile['Days since package purchase'] || ''}</td>
      <td>${profile['Days since membership purchase'] || ''}</td>
      <td>${formatCurrency(profile['Profile Total Spent'])}</td>
      <td>${profile['Profile Total Attended']}</td>
      <td>${formatCurrency(profile['Average Revenue'])}</td>
    `;

    tbody.appendChild(row);
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}