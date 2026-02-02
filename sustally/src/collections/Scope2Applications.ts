import type { CollectionConfig } from "payload";
// import { afterChangeHook } from "./Scope2Hooks"; // Removed static import to prevent client-side issues

const Scope2Applications: CollectionConfig = {
  slug: "scope2-applications",
  admin: {
    useAsTitle: "facilityName",
  },
  access: {
    create: () => true, // Allow anyone to create applications
    read: () => true, // Allow anyone to read applications
    update: () => true, // Creating open access for now to resolve 401 error
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    afterChange: [
      async (args: any) => {
        // Only load and run the hook on the server
        if (typeof window === 'undefined') {
          const { afterChangeHook } = await import('./Scope2Hooks');
          return afterChangeHook(args);
        }
        return args.doc;
      }
    ],
  },
  fields: [
    {
      name: "email",
      type: "email",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "rejectionReason",
      type: "textarea",
      admin: {
        position: "sidebar",
        condition: (data) => data?.status === "REJECTED",
      }
    },
    // Page 1 - Box 1
    {
      name: "state",
      type: "text",
      required: true,
    },
    {
      name: "siteCount",
      type: "text",
      required: true,
    },
    {
      name: "facilityName",
      type: "text",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" },
      ],
      defaultValue: "PENDING",
      required: true,
    },
    // Page 1 - Box 2
    {
      name: "renewableProcurement",
      type: "select",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      required: true,
    },
    {
      name: "onsiteExportedKwh",
      type: "text",
      required: true,
    },
    {
      name: "netMeteringApplicable",
      type: "select",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      required: true,
    },
    // Page 1 - Box 3
    {
      name: "reportingYear",
      type: "text",
      required: true,
    },
    {
      name: "reportingPeriod",
      type: "select",
      options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Quarterly", value: "Quarterly" },
        { label: "Annually", value: "Annually" },
      ],
      required: true,
    },
    {
      name: "conditionalApproach",
      type: "select",
      options: [
        { label: "Operational Control", value: "Operational Control" },
        { label: "Equity Share", value: "Equity Share" },
        { label: "Financial Control", value: "Financial Control" },
      ],
      required: true,
    },
    // Page 1 - Box 4
    {
      name: "scopeBoundaryNotes",
      type: "textarea",
      required: false,
    },
    // Page 2 - Box 1 (Energy Activity)
    {
      name: "energyActivityInput",
      type: "select",
      options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Yearly", value: "Yearly" },
      ],
      required: true,
    },
    {
      name: "energyCategory",
      type: "text",
      required: true,
    },
    {
      name: "trackingType",
      type: "select",
      options: [
        { label: "Unit consumption", value: "Unit consumption" },
        { label: "Spend amount", value: "Spend amount" },
        { label: "Both", value: "Both" },
      ],
      required: true,
    },
    {
      name: "energySupportingEvidenceFile",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "energySourceDescription",
      type: "textarea",
      required: false,
    },
    // Page 2 - Box 2 (Renewable Electricity)
    {
      name: "hasRenewableElectricity",
      type: "select",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      required: true,
    },
    {
      name: "renewableElectricity",
      type: "text",
    },
    {
      name: "renewableEnergyConsumption",
      type: "text",
    },
    {
      name: "renewableSupportingEvidenceFile",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "renewableEnergySourceDescription",
      type: "textarea",
      required: false,
    },
  ],
};

export default Scope2Applications;
