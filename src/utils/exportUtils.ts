import { DailyPerformanceReport, User } from '../types';

export function downloadReportCSV(reports: DailyPerformanceReport[], employeeName: string) {
  const headers = [
    'Report Date',
    'Day of Week',
    'Deposits Mobilized (ETB)',
    'Foreign Currency (USD)',
    'Digital Financial Services (ETB)',
    'Customer Onboarding',
    'Mobile Banking',
    'Internet Banking',
    'ATM Debit Cards',
    'Merchant Solutions',
    'Status',
    'Manager Comment'
  ];

  const rows = reports.map(r => [
    `"${r.reportDate || r.report_date || ''}"`,
    `"${r.dayOfWeek || r.day_of_week || ''}"`,
    r.depositsETB ?? r.deposits_etb ?? 0,
    r.foreignCurrencyETB ?? r.foreign_currency_etb ?? 0,
    r.digitalFinancialServicesETB ?? r.digital_financial_services_etb ?? 0,
    r.customerOnboarding ?? r.customer_onboarding ?? r.accountOpenings ?? 0,
    r.mobileBanking ?? r.mobile_banking ?? r.mobileBankingActivations ?? 0,
    r.internetBanking ?? r.internet_banking ?? r.internetBankingActivations ?? 0,
    r.atmDebitCards ?? r.atm_debit_cards ?? r.atmCardsIssued ?? 0,
    r.merchantSolutions ?? r.merchant_solutions ?? r.merchantSolutionsActivations ?? 0,
    `"${r.status || ''}"`,
    `"${(r.managerComment || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bunna_Bank_Report_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadReportExcel(reports: DailyPerformanceReport[], employeeName: string, user?: User) {
  const totalDeposits = reports.reduce((s, r) => s + (r.depositsETB ?? r.deposits_etb ?? 0), 0);
  const totalFCY = reports.reduce((s, r) => s + (r.foreignCurrencyETB ?? r.foreign_currency_etb ?? 0), 0);
  const totalDFS = reports.reduce((s, r) => s + (r.digitalFinancialServicesETB ?? r.digital_financial_services_etb ?? 0), 0);
  const totalAccounts = reports.reduce((s, r) => s + (r.customerOnboarding ?? r.customer_onboarding ?? r.accountOpenings ?? 0), 0);
  const totalMobile = reports.reduce((s, r) => s + (r.mobileBanking ?? r.mobile_banking ?? r.mobileBankingActivations ?? 0), 0);
  const totalInternet = reports.reduce((s, r) => s + (r.internetBanking ?? r.internet_banking ?? r.internetBankingActivations ?? 0), 0);

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Performance Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, sans-serif; }
        .header { background-color: #6B3F1D; color: #C89A2B; font-weight: bold; font-size: 16px; text-align: center; }
        .sub { background-color: #4A2C17; color: #ffffff; font-size: 11px; text-align: center; }
        th { background-color: #6B3F1D; color: #C89A2B; font-weight: bold; border: 1px solid #cccccc; padding: 6px; }
        td { border: 1px solid #dddddd; padding: 6px; text-align: left; }
        .num { text-align: right; }
        .total { background-color: #f3f4f6; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="12" class="header">BUNNA BANK S.C. - EMPLOYEE PERFORMANCE MANAGEMENT SYSTEM</td></tr>
        <tr><td colspan="12" class="sub">Performance Report for ${employeeName} (${user?.jobTitle || 'Officer'}) | Generated on ${new Date().toLocaleDateString()}</td></tr>
        <tr><td colspan="12"></td></tr>
        <tr>
          <th>Report Date</th>
          <th>Day</th>
          <th>Deposits Mobilized (ETB)</th>
          <th>Foreign Currency (USD)</th>
          <th>DFS Volume (ETB)</th>
          <th>Customer Onboarding</th>
          <th>Mobile Banking</th>
          <th>Internet Banking</th>
          <th>ATM Debit Cards</th>
          <th>Merchant Solutions</th>
          <th>Status</th>
          <th>Manager Comments</th>
        </tr>
        ${reports.map(r => `
          <tr>
            <td>${r.reportDate || r.report_date || ''}</td>
            <td>${r.dayOfWeek || r.day_of_week || ''}</td>
            <td class="num">${(r.depositsETB ?? r.deposits_etb ?? 0).toLocaleString()}</td>
            <td class="num">${(r.foreignCurrencyETB ?? r.foreign_currency_etb ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="num">${(r.digitalFinancialServicesETB ?? r.digital_financial_services_etb ?? 0).toLocaleString()}</td>
            <td class="num">${r.customerOnboarding ?? r.customer_onboarding ?? r.accountOpenings ?? 0}</td>
            <td class="num">${r.mobileBanking ?? r.mobile_banking ?? r.mobileBankingActivations ?? 0}</td>
            <td class="num">${r.internetBanking ?? r.internet_banking ?? r.internetBankingActivations ?? 0}</td>
            <td class="num">${r.atmDebitCards ?? r.atm_debit_cards ?? r.atmCardsIssued ?? 0}</td>
            <td class="num">${r.merchantSolutions ?? r.merchant_solutions ?? r.merchantSolutionsActivations ?? 0}</td>
            <td>${r.status || 'Pending'}</td>
            <td>${r.managerComment || ''}</td>
          </tr>
        `).join('')}
        <tr class="total">
          <td colspan="2">TOTAL ACHIEVEMENTS</td>
          <td class="num">${totalDeposits.toLocaleString()}</td>
          <td class="num">${totalFCY.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="num">${totalDFS.toLocaleString()}</td>
          <td class="num">${totalAccounts}</td>
          <td class="num">${totalMobile}</td>
          <td class="num">${totalInternet}</td>
          <td colspan="4"></td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bunna_Bank_Report_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadReportWord(reports: DailyPerformanceReport[], employeeName: string, user?: User) {
  const totalDeposits = reports.reduce((s, r) => s + (r.depositsETB || 0), 0);
  const totalMobile = reports.reduce((s, r) => s + (r.mobileBankingActivations || 0), 0);

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <title>Bunna Bank EPMS Performance Report</title>
      <style>
        body { font-family: 'Arial', sans-serif; color: #333333; line-height: 1.5; margin: 20px; }
        .logo-head { background: #6B3F1D; color: #C89A2B; padding: 15px; text-align: center; border-radius: 8px; }
        h1 { margin: 0; font-size: 20px; }
        p.sub { margin: 5px 0 0 0; color: #ffffff; font-size: 12px; }
        .summary-box { background: #f9f9f9; border: 1px solid #C89A2B; padding: 12px; margin: 15px 0; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background-color: #6B3F1D; color: #ffffff; border: 1px solid #6B3F1D; padding: 8px; text-align: left; }
        td { border: 1px solid #dddddd; padding: 8px; }
        .footer-sign { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="logo-head">
        <h1>BUNNA BANK S.C.</h1>
        <p class="sub">Official Employee Daily Performance & Evaluation Report</p>
      </div>

      <div class="summary-box">
        <p><strong>Employee Name:</strong> ${employeeName}</p>
        <p><strong>Job Title:</strong> ${user?.jobTitle || 'Banking Professional'}</p>
        <p><strong>Branch / Unit:</strong> ${user?.branchName || 'Finfinne Main Branch'}</p>
        <p><strong>Total Savings Mobilized:</strong> ETB ${totalDeposits.toLocaleString()}</p>
        <p><strong>Total Mobile Banking Activations:</strong> ${totalMobile} Users</p>
        <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <h3>Detailed Log of Submitted Daily Reports</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Deposits (ETB)</th>
            <th>FCY (USD)</th>
            <th>Accounts</th>
            <th>Mobile B.</th>
            <th>ATM Cards</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(r => `
            <tr>
              <td>${r.reportDate}</td>
              <td>${r.dayOfWeek}</td>
              <td>ETB ${(r.depositsETB || 0).toLocaleString()}</td>
              <td>USD ${(r.foreignCurrencyETB || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${r.accountOpenings || 0}</td>
              <td>${r.mobileBankingActivations || 0}</td>
              <td>${r.atmCardsIssued || 0}</td>
              <td><strong>${r.status}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 50px;">
        <p>__________________________<br/>Employee Signature</p>
        <br/>
        <p>__________________________<br/>Branch Manager Approval Signature</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bunna_Bank_Report_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrDownloadPDF(reports: DailyPerformanceReport[], employeeName: string, user?: User) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalDeposits = reports.reduce((s, r) => s + (r.depositsETB || 0), 0);
  const totalMobile = reports.reduce((s, r) => s + (r.mobileBankingActivations || 0), 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bunna Bank EPMS Performance Report - ${employeeName}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #111; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #6B3F1D; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #6B3F1D; }
        .tagline { font-size: 12px; color: #C89A2B; font-weight: 700; }
        .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #f4f6f5; padding: 15px; border-radius: 12px; border: 1px solid #e0e0e0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 12px; }
        th { background: #6B3F1D; color: #ffffff; text-align: left; padding: 10px; }
        td { border-bottom: 1px solid #e0e0e0; padding: 9px; }
        .total-row { background: #eef5f1; font-weight: bold; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">BUNNA BANK S.C.</div>
          <div class="tagline">EMPLOYEE PERFORMANCE MANAGEMENT SYSTEM</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #666;">
          <strong>Official Copy</strong><br/>
          Issued: ${new Date().toLocaleDateString()}
        </div>
      </div>

      <div class="meta-grid">
        <div><strong>Employee Name:</strong> ${employeeName}</div>
        <div><strong>Staff ID / Position:</strong> ${user?.id || 'N/A'} • ${user?.jobTitle || 'Banking Professional'}</div>
        <div><strong>Assigned Branch:</strong> ${user?.branchName || 'Finfinne Main Branch'}</div>
        <div><strong>Total Deposits Mobilized:</strong> ETB ${totalDeposits.toLocaleString()}</div>
        <div><strong>Total Mobile Banking Activations:</strong> ${totalMobile} Users</div>
        <div><strong>Status:</strong> Active Verified Employee</div>
      </div>

      <h3 style="margin-top: 25px; color: #6B3F1D;">Daily Performance Activity Log</h3>
      <table>
        <thead>
          <tr>
            <th>Report Date</th>
            <th>Day</th>
            <th>Savings Deposits (ETB)</th>
            <th>Foreign Currency (USD)</th>
            <th>Accounts</th>
            <th>Mobile Banking</th>
            <th>ATM Cards</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(r => `
            <tr>
              <td><strong>${r.reportDate}</strong></td>
              <td>${r.dayOfWeek}</td>
              <td style="color: #6B3F1D; font-weight: bold;">ETB ${(r.depositsETB || 0).toLocaleString()}</td>
              <td>USD ${(r.foreignCurrencyETB || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${r.accountOpenings || 0}</td>
              <td>${r.mobileBankingActivations || 0}</td>
              <td>${r.atmCardsIssued || 0}</td>
              <td>${r.status}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTALS</td>
            <td>ETB ${totalDeposits.toLocaleString()}</td>
            <td>USD ${reports.reduce((s, r) => s + (r.foreignCurrencyETB || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${reports.reduce((s, r) => s + (r.accountOpenings || 0), 0)}</td>
            <td>${totalMobile}</td>
            <td>${reports.reduce((s, r) => s + (r.atmCardsIssued || 0), 0)}</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px;">
        <div>
          <p>________________________</p>
          <p>Employee Signature</p>
        </div>
        <div>
          <p>________________________</p>
          <p>Branch Manager Approval & Stamp</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

import { Branch } from '../types';

export function downloadBranchesCSV(branches: Branch[]) {
  const headers = ['SOL ID', 'Branch Name', 'Telephone Lines', 'Parent District / Area Office', 'Region', 'Location / Address', 'Type', 'Status', 'Manager Name'];
  const rows = branches.map(b => [
    `"${b.solId || b.code || ''}"`,
    `"${(b.name || '').replace(/"/g, '""')}"`,
    `"${(b.phone || '').replace(/"/g, '""')}"`,
    `"${(b.districtName || '').replace(/"/g, '""')}"`,
    `"${(b.region || '').replace(/"/g, '""')}"`,
    `"${(b.location || '').replace(/"/g, '""')}"`,
    `"${b.type || 'Grade I'}"`,
    `"${b.status || 'Active'}"`,
    `"${(b.managerName || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bunna_Bank_Branch_Directory_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadBranchesExcel(branches: Branch[]) {
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Calibri, sans-serif; }
        .header { background-color: #6B3F1D; color: #C89A2B; font-weight: bold; font-size: 16px; text-align: center; }
        .sub { background-color: #4A2C17; color: #ffffff; font-size: 11px; text-align: center; }
        th { background-color: #6B3F1D; color: #C89A2B; font-weight: bold; border: 1px solid #cccccc; padding: 6px; }
        td { border: 1px solid #dddddd; padding: 6px; text-align: left; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="9" class="header">BUNNA BANK S.C. - BRANCH & AREA OFFICE DIRECTORY</td></tr>
        <tr><td colspan="9" class="sub">Exported on ${new Date().toLocaleDateString()} | Total Branches: ${branches.length}</td></tr>
        <tr><td colspan="9"></td></tr>
        <tr>
          <th>SOL ID</th>
          <th>Branch Name</th>
          <th>Telephone Line(s)</th>
          <th>Parent District / Area Office</th>
          <th>Region</th>
          <th>Branch Address / Location</th>
          <th>Grade / Type</th>
          <th>Status</th>
          <th>Branch Manager</th>
        </tr>
        ${branches.map(b => `
          <tr>
            <td><strong>${b.solId || b.code || ''}</strong></td>
            <td>${b.name}</td>
            <td>${b.phone || '-'}</td>
            <td>${b.districtName}</td>
            <td>${b.region || '-'}</td>
            <td>${b.location || '-'}</td>
            <td>${b.type || 'Grade I'}</td>
            <td>${b.status || 'Active'}</td>
            <td>${b.managerName || '-'}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bunna_Bank_Branches_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrDownloadBranchesPDF(branches: Branch[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to view and print the Branch Directory PDF.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bunna Bank S.C. - Branch & Area Office Directory</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1f2937; }
        .header { text-align: center; border-bottom: 3px solid #C89A2B; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #6B3F1D; font-size: 22px; }
        .header p { margin: 4px 0 0; color: #4b5563; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
        th { background-color: #6B3F1D; color: #C89A2B; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #6B3F1D; }
        td { border: 1px solid #e5e7eb; padding: 6px; }
        tr:nth-child(even) { background-color: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BUNNA BANK S.C.</h1>
        <p><strong>Branch, District & Area Office Directory Report</strong> • Generated on ${new Date().toLocaleDateString()}</p>
        <p>Total Registered Branches: ${branches.length}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>SOL ID</th>
            <th>Branch Name</th>
            <th>Telephone Line(s)</th>
            <th>Parent District / Area Office</th>
            <th>Region</th>
            <th>Location / Address</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${branches.map(b => `
            <tr>
              <td><strong>${b.solId || b.code || ''}</strong></td>
              <td>${b.name}</td>
              <td>${b.phone || '-'}</td>
              <td>${b.districtName}</td>
              <td>${b.region || '-'}</td>
              <td>${b.location || '-'}</td>
              <td>${b.type || 'Grade I'}</td>
              <td>${b.status || 'Active'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
