import { Campaign } from '../data/schema'
import * as XLSX from 'xlsx'

// Helper function to convert campaign data to a format suitable for Excel
function prepareCampaignDataForExcel(campaigns: Campaign[]): Record<string, any>[] {
  return campaigns.map(campaign => ({
    'ID': campaign.id,
    'Name': campaign.name,
    'Offer ID': campaign.offer_id,
    'Description': campaign.description || '',
    'Status': campaign.status,
    'Start Date': new Date(campaign.start_date).toLocaleDateString(),
    'End Date': new Date(campaign.end_date).toLocaleDateString(),
    'Created By': campaign.created_by_username,
    'Created At': new Date(campaign.created_at).toLocaleDateString(),
  }))
}

// Export all campaigns to Excel
export function exportCampaignsToExcel(campaigns: Campaign[], filename = 'campaigns-export'): void {
  const data = prepareCampaignDataForExcel(campaigns)
  
  // Create a new workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Campaigns')
  
  // Save the workbook
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Export filtered campaigns to Excel
export function exportFilteredCampaignsToExcel(campaigns: Campaign[]): void {
  exportCampaignsToExcel(campaigns, 'filtered-campaigns')
}

// Export selected campaigns to Excel
export function exportSelectedCampaignsToExcel(
  campaigns: Campaign[], 
  selectedRows: Record<string, boolean>
): void {
  // Get the selected campaigns
  const selectedCampaigns = Object.keys(selectedRows)
    .map(index => campaigns[parseInt(index)])
    .filter(Boolean)
  
  exportCampaignsToExcel(selectedCampaigns, 'selected-campaigns')
} 