// Constants for date calculations
const TODAY = new Date();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

// Parse date from DD/MM/YY format
function parseDate(dateStr) {
  if (!dateStr || dateStr === '--' || dateStr === 'Unlimited') return null;
  
  const [day, month, year] = dateStr.split('/').map(part => parseInt(part, 10));
  return new Date(2000 + year, month - 1, day); // Assuming all years are 20xx
}

// Format date to DD/MM/YY
function formatDate(date) {
  if (!date) return '--';
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${(date.getFullYear() % 100).toString().padStart(2, '0')}`;
}

// Calculate days between dates
function daysBetween(date1, date2) {
  if (!date1 || !date2) return null;
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format currency
function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// Get full name
function getFullName(member) {
  return `${member.firstName} ${member.lastName}`.trim();
}

// Normalize phone number for WhatsApp
function normalizePhone(phone) {
  if (!phone) return '';
  
  // Remove non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Handle country code
  if (digits.startsWith('62')) {
    return digits;
  } else if (digits.startsWith('0')) {
    return '62' + digits.substring(1);
  } else if (digits.startsWith('44')) {
    return digits; // UK number
  }
  
  return digits;
}

// Generate WhatsApp deep link
function generateWhatsAppLink(phone, message) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return '#';
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

// Determine member status
function getMemberStatus(member) {
  const expiryDate = parseDate(member.expirationDate);
  const lastBookingDate = parseDate(member.lastBookingDate);
  
  // Handle unlimited memberships differently
  if (member.expirationDate === 'Unlimited') {
    if (member.status === 'Active') {
      return 'active';
    } else if (member.status === 'Unpaid' || member.status === 'Overdue') {
      return 'unpaid';
    } else if (member.status === 'Frozen') {
      return 'frozen';
    }
    
    // Check if dormant (no booking in 30+ days)
    if (lastBookingDate && (TODAY - lastBookingDate > THIRTY_DAYS_MS)) {
      return 'dormant';
    }
    
    return member.status.toLowerCase();
  }
  
  // For non-unlimited memberships
  if (!expiryDate) return 'unknown';
  
  if (expiryDate < TODAY) {
    return 'expired';
  }
  
  if (TODAY - lastBookingDate > THIRTY_DAYS_MS) {
    return 'dormant';
  }
  
  if (expiryDate - TODAY <= FOURTEEN_DAYS_MS) {
    return 'expiring';
  }
  
  return 'active';
}

// Calculate member status (legacy function maintained for compatibility)
function calculateMemberStatus(member) {
  const status = getMemberStatus(member);
  
  // Map new status format to old format
  const statusMap = {
    'active': 'Active',
    'unpaid': 'Unpaid',
    'frozen': 'Frozen',
    'dormant': 'Dormant',
    'expired': 'Expired',
    'expiring': 'Expiring Soon',
    'unknown': 'Unknown'
  };
  
  return statusMap[status] || 'Active';
}

// Check if member is expiring soon
function isExpiringSoon(member) {
  if (member.expirationDate === 'Unlimited') {
    const renewsOn = parseDate(member.renewsOn);
    return renewsOn && (renewsOn - TODAY <= FOURTEEN_DAYS_MS);
  }
  
  const expiryDate = parseDate(member.expirationDate);
  return expiryDate && (expiryDate - TODAY <= FOURTEEN_DAYS_MS) && (expiryDate > TODAY);
}

// Check if member is expired
function isExpired(member) {
  if (member.expirationDate === 'Unlimited') {
    return false;
  }
  
  const expiryDate = parseDate(member.expirationDate);
  return expiryDate && expiryDate < TODAY;
}

// Check if member is dormant
function isDormant(member) {
  const lastBookingDate = parseDate(member.lastBookingDate);
  return lastBookingDate && (TODAY - lastBookingDate > THIRTY_DAYS_MS);
}

// Calculate days since last visit
function calculateDaysSinceLastVisit(member) {
  const lastBookingDate = parseDate(member.lastBookingDate);
  if (!lastBookingDate) return null;
  return Math.floor((TODAY - lastBookingDate) / (1000 * 60 * 60 * 24));
}

// Get next step recommendation
function getNextStep(member) {
  if (member.isExpired) {
    return "Send offer";
  } else if (member.isExpiringSoon) {
    return "WhatsApp reminder";
  } else if (member.isDormant) {
    return "Call";
  }
  return "";
}

// Process members data
function processMembersData(members) {
  const processedMembers = members.map(member => {
    const calculatedStatus = calculateMemberStatus(member);
    return {
      ...member,
      calculatedStatus,
      isExpiringSoon: isExpiringSoon(member),
      isExpired: isExpired(member),
      isDormant: isDormant(member),
      fullName: getFullName(member),
      daysSinceLastVisit: calculateDaysSinceLastVisit(member),
      nextStep: getNextStep(member)
    };
  });
  
  return processedMembers;
}

// Update summary cards
function updateSummaryCards(members) {
  const totalCount = members.length;
  const activeCount = members.filter(m => m.calculatedStatus === 'Active').length;
  const expiringCount = members.filter(m => m.isExpiringSoon).length;
  const expiredCount = members.filter(m => m.isExpired).length;
  const dormantCount = members.filter(m => m.isDormant).length;
  
  document.getElementById('total-count').textContent = totalCount;
  document.getElementById('active-count').textContent = activeCount;
  document.getElementById('expiring-count').textContent = expiringCount;
  document.getElementById('expired-count').textContent = expiredCount;
  document.getElementById('dormant-count').textContent = dormantCount;
}

// Update churn watch table
function updateChurnTable(members) {
  const tableBody = document.getElementById('churn-table-body');
  tableBody.innerHTML = '';
  
  // Filter for at-risk members (expired, dormant, and now also expiring)
  const churnMembers = members.filter(m => m.isExpired || m.isDormant || m.isExpiringSoon);
  
  // Initially show only 3 members
  const initialDisplayCount = 3;
  const displayMembers = churnMembers.slice(0, initialDisplayCount);
  const remainingCount = churnMembers.length - initialDisplayCount;
  
  // Add the visible members
  displayMembers.forEach(member => addMemberRow(member, tableBody));
  
  // Add "Show More" row if there are more members
  if (remainingCount > 0) {
    const showMoreRow = document.createElement('tr');
    showMoreRow.id = 'show-more-row';
    showMoreRow.className = 'show-more-row';
    
    const showMoreCell = document.createElement('td');
    showMoreCell.colSpan = 8;
    showMoreCell.textContent = `Show ${remainingCount} more members`;
    showMoreCell.style.textAlign = 'center';
    showMoreCell.style.cursor = 'pointer';
    showMoreCell.style.color = 'var(--primary-color)';
    showMoreCell.style.fontWeight = 'bold';
    
    showMoreCell.addEventListener('click', () => {
      // Remove the "Show More" row
      document.getElementById('show-more-row').remove();
      
      // Add the remaining members
      churnMembers.slice(initialDisplayCount).forEach(member => {
        addMemberRow(member, tableBody);
      });
    });
    
    showMoreRow.appendChild(showMoreCell);
    tableBody.appendChild(showMoreRow);
  }
}

// Helper function to add a member row to the table
function addMemberRow(member, tableBody) {
  const row = document.createElement('tr');
  
  // Add status data attribute for filtering
  if (member.isExpired) row.setAttribute('data-status', 'expired');
  else if (member.isDormant) row.setAttribute('data-status', 'dormant');
  else if (member.isExpiringSoon) row.setAttribute('data-status', 'expiring');
  
  // Name column
  const nameCell = document.createElement('td');
  nameCell.textContent = member.fullName;
  row.appendChild(nameCell);
  
  // Phone column
  const phoneCell = document.createElement('td');
  phoneCell.textContent = member.mobile;
  row.appendChild(phoneCell);
  
  // Expiry column
  const expiryCell = document.createElement('td');
  expiryCell.textContent = member.expirationDate === 'Unlimited' ? member.renewsOn : member.expirationDate;
  row.appendChild(expiryCell);
  
  // Last Visit column
  const lastVisitCell = document.createElement('td');
  lastVisitCell.textContent = member.lastBookingDate;
  row.appendChild(lastVisitCell);
  
  // Days Since Visit column
  const daysSinceVisitCell = document.createElement('td');
  daysSinceVisitCell.textContent = member.daysSinceLastVisit || '--';
  row.appendChild(daysSinceVisitCell);
  
  // Plan column
  const planCell = document.createElement('td');
  planCell.textContent = member.category;
  row.appendChild(planCell);
  
  // Next Step column
  const nextStepCell = document.createElement('td');
  nextStepCell.textContent = member.nextStep;
  row.appendChild(nextStepCell);
  
  // Action column
  const actionCell = document.createElement('td');
  const whatsappBtn = document.createElement('button');
  whatsappBtn.className = 'whatsapp-btn';
  whatsappBtn.textContent = 'WhatsApp';
  
  const message = member.isExpired 
    ? `Hi ${member.firstName}, your ${member.category} has expired. Would you like to renew?` 
    : `Hi ${member.firstName}, we miss you at Bang! Studio. Would you like to book a class soon?`;
  
  // Add message preview
  const messagePreview = document.createElement('div');
  messagePreview.className = 'message-preview';
  messagePreview.textContent = message;
  whatsappBtn.appendChild(messagePreview);
  
  whatsappBtn.onclick = () => {
    window.open(generateWhatsAppLink(member.mobile, message), '_blank');
  };
  
  actionCell.appendChild(whatsappBtn);
  row.appendChild(actionCell);
  
  tableBody.appendChild(row);
}

// Update renewal pipeline chart
function updateRenewalChart(members) {
  const expiringMembers = members.filter(m => m.isExpiringSoon);
  
  // Group by week
  const weeklyData = {};
  const currentDate = new Date(TODAY);
  
  // Initialize weeks
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekLabel = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    weeklyData[weekLabel] = 0;
  }
  
  // Count members expiring in each week
  expiringMembers.forEach(member => {
    const expiryDate = member.expirationDate === 'Unlimited' 
      ? parseDate(member.renewsOn) 
      : parseDate(member.expirationDate);
    
    if (!expiryDate) return;
    
    for (const [weekLabel, count] of Object.entries(weeklyData)) {
      const [startStr, endStr] = weekLabel.split(' - ');
      const weekStart = parseDate(startStr);
      const weekEnd = parseDate(endStr);
      
      if (expiryDate >= weekStart && expiryDate <= weekEnd) {
        weeklyData[weekLabel]++;
        break;
      }
    }
  });
  
  // Create chart
  const ctx = document.getElementById('renewal-chart').getContext('2d');
  
  if (window.renewalChart) {
    window.renewalChart.destroy();
  }
  
  window.renewalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(weeklyData),
      datasets: [{
        label: 'Members Expiring',
        data: Object.values(weeklyData),
        backgroundColor: 'rgba(255, 51, 119, 0.7)',
        borderColor: 'rgba(255, 0, 85, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Update revenue snapshot
function updateRevenueSnapshot(members) {
  const activeMembers = members.filter(m => m.calculatedStatus === 'Active');
  const expiringMembers = members.filter(m => m.isExpiringSoon);
  
  const activeRevenue = activeMembers.reduce((sum, member) => sum + member.price, 0);
  const potentialRevenue = expiringMembers.reduce((sum, member) => sum + member.price, 0);
  
  document.getElementById('active-revenue').textContent = formatCurrency(activeRevenue);
  document.getElementById('potential-revenue').textContent = formatCurrency(potentialRevenue);
}

// Export members to CSV
function exportMembersToCSV(members, filename) {
  const headers = ['Name', 'Phone', 'Personalized Message'];
  const rows = members.map(member => {
    const message = member.isExpired 
      ? `Hi ${member.firstName}, your ${member.category} has expired. Would you like to renew?` 
      : `Hi ${member.firstName}, we miss you at Bang! Studio. Would you like to book a class soon?`;
    
    return [
      member.fullName,
      normalizePhone(member.mobile),
      message
    ];
  });
  
  // Add headers
  rows.unshift(headers);
  
  // Convert to CSV
  const csvContent = rows.map(row => row.map(cell => {
    // Escape quotes and wrap in quotes if needed
    const escaped = String(cell).replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  }).join(',')).join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize the dashboard
function initDashboard() {
  const processedMembers = processMembersData(membersData);
  
  // Update all sections
  updateSummaryCards(processedMembers);
  updateChurnTable(processedMembers);
  updateRenewalChart(processedMembers);
  updateRevenueSnapshot(processedMembers);
  
  // Set up export buttons
  document.getElementById('export-expired').addEventListener('click', () => {
    const expiredMembers = processedMembers.filter(m => m.isExpired);
    exportMembersToCSV(expiredMembers, 'bang-expired-members.csv');
  });
  
  document.getElementById('export-dormant').addEventListener('click', () => {
    const dormantMembers = processedMembers.filter(m => m.isDormant);
    exportMembersToCSV(dormantMembers, 'bang-dormant-members.csv');
  });
  
  document.getElementById('export-expiring').addEventListener('click', () => {
    const expiringMembers = processedMembers.filter(m => m.isExpiringSoon);
    exportMembersToCSV(expiringMembers, 'bang-expiring-members.csv');
  });
  
  document.getElementById('export-all').addEventListener('click', () => {
    exportMembersToCSV(processedMembers, 'bang-all-members.csv');
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);