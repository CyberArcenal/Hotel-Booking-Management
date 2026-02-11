/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage values
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, decimals = 2) {
  return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Generate CSV from data array
 * @param {Array} data - Data array
 * @param {Array} headers - Column headers
 * @returns {string} CSV string
 */
function generateCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }
  
  const csvRows = [];
  
  // Use provided headers or extract from first object
  const headerRow = headers || Object.keys(data[0]);
  csvRows.push(headerRow.join(','));
  
  // Add data rows
  data.forEach(item => {
    const row = headerRow.map(header => {
      let value = item[header];
      
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      // Escape commas and quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }
      
      return value !== undefined ? value : '';
    });
    
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Generate HTML table from data
 * @param {Array} data - Data array
 * @param {Array} headers - Column headers
 * @param {Object} options - Table options
 * @returns {string} HTML table
 */
function generateHTMLTable(data, headers = null, options = {}) {
  if (!data || data.length === 0) {
    return '<table><tr><td>No data available</td></tr></table>';
  }
  
  const {
    tableClass = 'report-table',
    headerClass = 'table-header',
    rowClass = 'table-row',
    cellClass = 'table-cell'
  } = options;
  
  const headerRow = headers || Object.keys(data[0]);
  
  let html = `<table class="${tableClass}">`;
  
  // Add header row
  html += '<thead><tr>';
  headerRow.forEach(header => {
    html += `<th class="${headerClass}">${header}</th>`;
  });
  html += '</tr></thead>';
  
  // Add data rows
  html += '<tbody>';
  data.forEach((item, index) => {
    html += `<tr class="${rowClass} ${index % 2 === 0 ? 'even-row' : 'odd-row'}">`;
    
    headerRow.forEach(header => {
      let value = item[header];
      
      // Format based on data type
      if (typeof value === 'number') {
        // Check if it's currency
        if (header.toLowerCase().includes('price') || 
            header.toLowerCase().includes('revenue') || 
            header.toLowerCase().includes('total')) {
          value = formatCurrency(value);
        }
        // Check if it's percentage
        else if (header.toLowerCase().includes('rate') || 
                 header.toLowerCase().includes('percentage')) {
          value = formatPercentage(value);
        }
      }
      
      html += `<td class="${cellClass}">${value || ''}</td>`;
    });
    
    html += '</tr>';
  });
  html += '</tbody></table>';
  
  return html;
}

/**
 * Generate chart data structure for frontend
 * @param {Array} data - Data array
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart-ready data
 */
function generateChartData(data, config) {
  const { 
    type = 'line',
    xField,
    yField,
    labelField,
    datasetLabel = 'Data',
    colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
  } = config;
  
  if (type === 'pie' || type === 'doughnut') {
    return {
      labels: data.map(item => item[labelField] || item[xField]),
      datasets: [{
        data: data.map(item => item[yField]),
        backgroundColor: colors.slice(0, data.length)
      }]
    };
  } else {
    return {
      labels: data.map(item => item[xField]),
      datasets: [{
        label: datasetLabel,
        data: data.map(item => item[yField]),
        backgroundColor: type === 'bar' ? colors[0] : 'transparent',
        borderColor: colors[0],
        borderWidth: 2,
        fill: type === 'line'
      }]
    };
  }
}

/**
 * Calculate summary statistics
 * @param {Array} data - Numeric data array
 * @returns {Object} Statistics
 */
function calculateStatistics(data) {
  if (!data || data.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
      median: 0
    };
  }
  
  const numericData = data.filter(item => typeof item === 'number');
  const sorted = [...numericData].sort((a, b) => a - b);
  
  const sum = sorted.reduce((a, b) => a + b, 0);
  const average = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  let median;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }
  
  return {
    count: sorted.length,
    sum,
    average: parseFloat(average.toFixed(2)),
    min,
    max,
    median: parseFloat(median.toFixed(2))
  };
}

module.exports = {
  formatCurrency,
  formatPercentage,
  generateCSV,
  generateHTMLTable,
  generateChartData,
  calculateStatistics
};