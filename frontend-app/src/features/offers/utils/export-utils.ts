import * as XLSX from 'xlsx';
import { Offer } from '../data/schema';

/**
 * Prepares offer data for Excel export by flattening nested properties
 */
const prepareOffersForExport = (offers: Offer[]) => {
  return offers.map(offer => {
    // Extract nested data properties if needed
    const { data, ...rest } = offer;
    
    // Return flattened object with relevant fields
    return {
      ID: offer.id,
      Description: offer.offer_description,
      Type: offer.offer_type,
      Status: offer.status,
      'Created By': offer.created_by_username,
      'Created At': new Date(offer.created_at).toLocaleDateString(),
      'Updated At': new Date(offer.updated_at).toLocaleDateString(),
      Tenant: offer.tenant_name,
      Comments: offer.comments || '',
      // Add any additional data fields that should be included
    };
  });
};

/**
 * Export offers to Excel file
 */
export const exportOffersToExcel = (offers: Offer[], fileName: string = 'offers-export') => {
  // Prepare data for export
  const data = prepareOffersForExport(offers);
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Offers');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export selected offers to Excel
 */
export const exportSelectedOffersToExcel = (offers: Offer[], selectedRows: Record<string, boolean>) => {
  // Filter offers based on selected rows
  const selectedOffers = offers.filter((_, index) => selectedRows[index]);
  
  // Export selected offers
  exportOffersToExcel(selectedOffers, 'selected-offers-export');
};

/**
 * Export filtered offers to Excel
 */
export const exportFilteredOffersToExcel = (filteredOffers: Offer[]) => {
  exportOffersToExcel(filteredOffers, 'filtered-offers-export');
}; 