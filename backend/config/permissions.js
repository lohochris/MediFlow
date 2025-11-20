export const permissions = {
  SuperAdmin: {
    all: true   // not used programmatically, but good documentation
  },

  Admin: {
    viewAll: true,
    editAll: true,
    deleteSoft: true,
    deleteHard: true,
    manageUsers: true,
    manageDepartments: true,
    manageSystem: true
  },

  Management: {
    viewAnalytics: true
  },

  Doctor: {
    viewPatients: true,
    editPatients: true,
    prescribe: true,
    labRequest: true,
    radiologyOrder: true
  },

  Nurse: {
    viewPatients: true,
    editVitals: true
  },

  Pharmacist: {
    viewPrescriptions: true,
    dispense: true,
    manageStock: true
  },

  LabScientist: {
    addLabResults: true
  },

  Radiologist: {
    uploadRadiologyResult: true
  },

  BillingOfficer: {
    createInvoice: true,
    acceptPayment: true
  },

  Accountant: {
    viewFinanceReports: true
  },

  Patient: {
    viewSelf: true,
    editSelf: true,
    deleteSelf: "soft"
  }
};
