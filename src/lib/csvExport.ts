/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

export function exportToCSV(data: any[], filename: string, columns?: string[]) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get column headers
  const headers = columns || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Escape commas and quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCropsToCSV(crops: any[]) {
  const columns = ['name', 'variety', 'field_assigned', 'planting_date', 'expected_harvest_date', 'growth_stage', 'expected_yield', 'actual_yield'];
  exportToCSV(crops, 'crops_export', columns);
}

export function exportFinancialRecordsToCSV(records: any[]) {
  const columns = ['record_date', 'record_type', 'category', 'amount', 'description'];
  exportToCSV(records, 'financial_records_export', columns);
}

export function exportLivestockToCSV(livestock: any[]) {
  const columns = ['animal_type', 'breed', 'count', 'date_acquired', 'weight', 'last_vet_visit', 'next_vaccination_date'];
  exportToCSV(livestock, 'livestock_export', columns);
}

export function exportOrdersToCSV(orders: any[]) {
  const columns = ['buyer_name', 'product_name', 'quantity', 'total_amount', 'order_status', 'payment_status', 'order_date'];
  exportToCSV(orders, 'orders_export', columns);
}

export function exportInventoryToCSV(inventory: any[]) {
  const columns = ['item_name', 'category', 'quantity', 'unit', 'reorder_threshold'];
  exportToCSV(inventory, 'inventory_export', columns);
}
