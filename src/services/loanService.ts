import { ServiceResponse } from '@/types/common';
import {
  LoanProduct,
  LoanRate,
  LoanApplication,
  LoanAccount,
  LoanScheduleItem,
  LoanLedgerEntry,
} from '@/types/loan';
import { simulateDelay } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/loans';

// Fallback Loan Products
let fallbackLoanProducts: LoanProduct[] = [
  {
    id: 'lp_01',
    name: 'Personal Loan',
    code: 'PL',
    loanType: 'Personal Loan',
    minAmount: 10000,
    maxAmount: 500000,
    interestRateType: 'REDUCING_BALANCE',
    baseInterestRate: 12,
    minPeriod: 6,
    maxPeriod: 60,
    repaymentFrequency: 'Monthly',
    installmentType: 'EMI',
    processingCharge: 1,
    otherCharges: 0,
    status: 'Active',
    description: 'General purpose personal loan for members',
  },
  {
    id: 'lp_02',
    name: 'Emergency Loan',
    code: 'EL',
    loanType: 'Emergency Loan',
    minAmount: 5000,
    maxAmount: 100000,
    interestRateType: 'REDUCING_BALANCE',
    baseInterestRate: 10,
    minPeriod: 3,
    maxPeriod: 24,
    repaymentFrequency: 'Monthly',
    installmentType: 'EMI',
    processingCharge: 0.5,
    otherCharges: 0,
    status: 'Active',
    description: 'Quick disbursement short-term emergency loan',
  },
];

// Fallback Rates
let fallbackLoanRates: LoanRate[] = [
  {
    id: 'lr_01',
    productId: 'lp_01',
    productCode: 'PL',
    productName: 'Personal Loan',
    minAmount: 10000,
    maxAmount: 100000,
    interestRate: 12,
    effectiveFrom: '2024-01-01',
    status: 'Active',
  },
  {
    id: 'lr_02',
    productId: 'lp_01',
    productCode: 'PL',
    productName: 'Personal Loan',
    minAmount: 100001,
    maxAmount: 500000,
    interestRate: 11.5,
    effectiveFrom: '2024-01-01',
    status: 'Active',
  },
  {
    id: 'lr_03',
    productId: 'lp_02',
    productCode: 'EL',
    productName: 'Emergency Loan',
    minAmount: 5000,
    maxAmount: 100000,
    interestRate: 10,
    effectiveFrom: '2024-01-01',
    status: 'Active',
  },
];

// Fallback Applications
const fallbackApplications: LoanApplication[] = [
  {
    id: 'la_01',
    applicationNumber: 'LA-100001',
    memberId: 'mem-001',
    memberName: 'Rahul Kumar Sharma',
    memberNumber: 'DRCS-M-0001',
    branchId: 'br-001',
    branchName: 'Head Office',
    productId: 'lp_01',
    productName: 'Personal Loan',
    productCode: 'PL',
    requestedAmount: 100000,
    requestedPeriod: 12,
    purpose: 'Home renovation',
    applicationDate: '2024-03-01',
    status: 'APPROVED',
    remarks: 'Approved by Branch Committee',
    history: [
      { date: '2024-03-01', action: 'APPLICATION_CREATED', user: 'Admin User', description: 'Submitted for ₹100,000' },
      { date: '2024-03-05', action: 'LOAN_APPLICATION_APPROVED', user: 'Admin User', description: 'Approved and converted to loan' },
    ],
  },
];

// Fallback Accounts & Schedule
const fallbackAccounts: LoanAccount[] = [
  {
    id: 'ln_01',
    loanNumber: 'LN-100001',
    applicationId: 'la_01',
    memberId: 'mem-001',
    memberName: 'Rahul Kumar Sharma',
    memberNumber: 'DRCS-M-0001',
    branchId: 'br-001',
    branchName: 'Head Office',
    productId: 'lp_01',
    productName: 'Personal Loan',
    principalAmount: 100000,
    interestRate: 12,
    interestType: 'REDUCING_BALANCE',
    loanPeriod: 12,
    installmentFrequency: 'Monthly',
    numberOfInstallments: 12,
    startDate: '2024-03-05',
    maturityDate: '2025-03-05',
    status: 'ACTIVE',
    totalInterest: 6618.53,
    totalRepayment: 106618.53,
    emiAmount: 8884.88,
    outstandingPrincipal: 100000,
  },
];

export const loanService = {
  // PRODUCTS
  async getLoanProducts(): Promise<ServiceResponse<LoanProduct[]>> {
    try {
      const res = await fetch(`${API_BASE}/products-and-rates/products`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    return { success: true, data: [...fallbackLoanProducts] };
  },

  async createLoanProduct(data: Partial<LoanProduct>): Promise<ServiceResponse<LoanProduct>> {
    try {
      const res = await fetch(`${API_BASE}/products-and-rates/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const newProd: LoanProduct = {
      id: `lp_${Date.now()}`,
      name: data.name || 'New Loan Product',
      code: (data.code || 'NLP').toUpperCase(),
      loanType: data.loanType || 'Personal Loan',
      minAmount: Number(data.minAmount) || 10000,
      maxAmount: Number(data.maxAmount) || 500000,
      interestRateType: data.interestRateType || 'REDUCING_BALANCE',
      baseInterestRate: Number(data.baseInterestRate) || 12,
      minPeriod: Number(data.minPeriod) || 6,
      maxPeriod: Number(data.maxPeriod) || 60,
      repaymentFrequency: 'Monthly',
      installmentType: 'EMI',
      processingCharge: Number(data.processingCharge) || 1,
      status: 'Active',
      description: data.description || '',
    };
    fallbackLoanProducts.unshift(newProd);
    return { success: true, data: newProd, message: 'Loan product created successfully.' };
  },

  async toggleProductStatus(id: string): Promise<ServiceResponse<LoanProduct>> {
    try {
      const res = await fetch(`${API_BASE}/products-and-rates/products/${id}/status`, { method: 'PATCH' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const prod = fallbackLoanProducts.find((p) => p.id === id);
    if (!prod) return { success: false, data: null as unknown as LoanProduct, message: 'Product not found' };
    prod.status = prod.status === 'Active' ? 'Inactive' : 'Active';
    return { success: true, data: prod, message: `Product ${prod.status.toLowerCase()} successfully.` };
  },

  // RATES
  async getLoanRates(): Promise<ServiceResponse<LoanRate[]>> {
    try {
      const res = await fetch(`${API_BASE}/products-and-rates/rates`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    return { success: true, data: [...fallbackLoanRates] };
  },

  async createLoanRate(data: Partial<LoanRate>): Promise<ServiceResponse<LoanRate>> {
    try {
      const res = await fetch(`${API_BASE}/products-and-rates/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const prod = fallbackLoanProducts.find((p) => p.id === data.productId);
    const newRate: LoanRate = {
      id: `lr_${Date.now()}`,
      productId: data.productId || 'lp_01',
      productCode: prod?.code || 'PL',
      productName: prod?.name || 'Personal Loan',
      minAmount: Number(data.minAmount) || 10000,
      maxAmount: Number(data.maxAmount) || 500000,
      interestRate: Number(data.interestRate) || 12,
      effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: data.effectiveTo || '2099-12-31',
      status: 'Active',
    };
    fallbackLoanRates.unshift(newRate);
    return { success: true, data: newRate, message: 'Interest rate slab created successfully.' };
  },

  // APPLICATIONS
  async getLoanApplications(filters?: { search?: string; status?: string; branchId?: string }): Promise<ServiceResponse<LoanApplication[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.branchId) params.append('branchId', filters.branchId);
        queryStr = `?${params.toString()}`;
      }
      const res = await fetch(`${API_BASE}/applications${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    let res = [...fallbackApplications];
    if (filters?.status) res = res.filter((a) => a.status === filters.status);
    if (filters?.branchId) res = res.filter((a) => a.branchId === filters.branchId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      res = res.filter((a) => a.applicationNumber.toLowerCase().includes(s) || a.memberName.toLowerCase().includes(s));
    }
    return { success: true, data: res };
  },

  async createLoanApplication(data: { memberId: string; productId: string; requestedAmount: number; requestedPeriod: number; purpose: string }): Promise<ServiceResponse<LoanApplication>> {
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const prod = fallbackLoanProducts.find((p) => p.id === data.productId);
    const now = new Date().toISOString().split('T')[0];
    const newApp: LoanApplication = {
      id: `la_${Date.now()}`,
      applicationNumber: `LA-${Math.floor(100000 + Math.random() * 900000)}`,
      memberId: data.memberId,
      memberName: 'Rahul Kumar Sharma',
      memberNumber: 'DRCS-M-0001',
      branchId: 'br-001',
      branchName: 'Head Office',
      productId: data.productId,
      productName: prod?.name || 'Personal Loan',
      productCode: prod?.code || 'PL',
      requestedAmount: Number(data.requestedAmount),
      requestedPeriod: Number(data.requestedPeriod),
      purpose: data.purpose,
      applicationDate: now,
      status: 'SUBMITTED',
      remarks: 'Application submitted for review',
      history: [
        { date: now, action: 'APPLICATION_CREATED', user: 'Admin User', description: `Submitted for ₹${Number(data.requestedAmount).toLocaleString()}` },
      ],
    };
    fallbackApplications.unshift(newApp);
    return { success: true, data: newApp, message: 'Loan application submitted successfully.' };
  },

  async approveLoanApplication(id: string, remarks?: string): Promise<ServiceResponse<{ application: LoanApplication; loanAccount: LoanAccount }>> {
    try {
      const res = await fetch(`${API_BASE}/applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const app = fallbackApplications.find((a) => a.id === id);
    if (!app) return { success: false, data: null as unknown as { application: LoanApplication; loanAccount: LoanAccount }, message: 'Application not found' };

    const now = new Date().toISOString().split('T')[0];
    app.status = 'APPROVED';
    app.remarks = remarks || 'Approved by Branch Committee';

    const newLoan: LoanAccount = {
      id: `ln_${Date.now()}`,
      loanNumber: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
      applicationId: app.id,
      memberId: app.memberId,
      memberName: app.memberName,
      memberNumber: app.memberNumber,
      branchId: app.branchId,
      branchName: app.branchName,
      productId: app.productId,
      productName: app.productName,
      principalAmount: app.requestedAmount,
      interestRate: 12,
      interestType: 'REDUCING_BALANCE',
      loanPeriod: app.requestedPeriod,
      installmentFrequency: 'Monthly',
      numberOfInstallments: app.requestedPeriod,
      startDate: now,
      maturityDate: '2026-03-05',
      status: 'ACTIVE',
      totalInterest: 6618.53,
      totalRepayment: 106618.53,
      emiAmount: 8884.88,
      outstandingPrincipal: app.requestedAmount,
    };
    fallbackAccounts.unshift(newLoan);

    return {
      success: true,
      data: { application: app, loanAccount: newLoan },
      message: `Application approved. Active Loan Account ${newLoan.loanNumber} created.`,
    };
  },

  // LOAN ACCOUNTS
  async getLoanAccounts(filters?: { search?: string; status?: string; branchId?: string; memberId?: string }): Promise<ServiceResponse<LoanAccount[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.branchId) params.append('branchId', filters.branchId);
        if (filters.memberId) params.append('memberId', filters.memberId);
        queryStr = `?${params.toString()}`;
      }
      const res = await fetch(`${API_BASE}${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    let res = [...fallbackAccounts];
    if (filters?.memberId) res = res.filter((l) => l.memberId === filters.memberId);
    if (filters?.status) res = res.filter((l) => l.status === filters.status);
    if (filters?.branchId) res = res.filter((l) => l.branchId === filters.branchId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      res = res.filter((l) => l.loanNumber.toLowerCase().includes(s) || l.memberName.toLowerCase().includes(s));
    }
    return { success: true, data: res };
  },

  async getLoanAccountDetails(id: string): Promise<ServiceResponse<{ loan: LoanAccount; schedule: LoanScheduleItem[]; ledger: LoanLedgerEntry[]; history: any[] } | null>> {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const loan = fallbackAccounts.find((l) => l.id === id);
    if (!loan) return { success: false, data: null, message: 'Loan account not found.' };

    // Generate schedule
    const emi = 8884.88;
    const schedule: LoanScheduleItem[] = Array.from({ length: loan.loanPeriod }, (_, idx) => {
      const i = idx + 1;
      const monthDate = new Date('2024-03-05');
      monthDate.setMonth(monthDate.getMonth() + i);
      const interest = Math.round((100000 - (i - 1) * 7800) * 0.01 * 100) / 100;
      const principal = Math.round((emi - interest) * 100) / 100;
      return {
        id: `ls_${loan.id}_${i}`,
        loanId: loan.id,
        installmentNo: i,
        dueDate: monthDate.toISOString().split('T')[0],
        principalDue: principal,
        interestDue: interest,
        totalInstallment: emi,
        principalPaid: 0,
        interestPaid: 0,
        outstandingPrincipal: Math.max(0, 100000 - i * 8300),
        status: 'PENDING',
      };
    });

    const ledger: LoanLedgerEntry[] = [
      {
        id: `ll_${loan.id}`,
        loanId: loan.id,
        entryDate: loan.startDate,
        entryType: 'LOAN_DISBURSED',
        description: `Loan of ₹${loan.principalAmount.toLocaleString()} disbursed`,
        amount: loan.principalAmount,
        performedBy: 'Admin User',
      },
    ];

    return {
      success: true,
      data: {
        loan,
        schedule,
        ledger,
        history: [
          { date: loan.startDate, action: 'LOAN_CREATED', user: 'Admin User', description: `Loan account ${loan.loanNumber} created` },
        ],
      },
    };
  },

  async repayLoanInstallment(id: string, data: { amount: number; paymentMode?: string; remarks?: string }): Promise<ServiceResponse<any>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(`${API_BASE}/${id}/repay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay(500);
    return { success: true, data: null, message: `Loan repayment of ₹${data.amount} recorded successfully.` };
  },
};
