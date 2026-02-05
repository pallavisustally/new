import type { CollectionConfig } from "payload";

const Applications: CollectionConfig = {
  slug: "applications",
  admin: {
    useAsTitle: "name",
  },
  access: {
    create: () => true, // Allow anyone to create applications
    read: () => true, // Allow anyone to read applications (optional, adjust as needed)
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "mobile",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "company",
      type: "text",
      required: true,
    },
    {
      name: "sector",
      type: "text",
      required: true,
    },
    {
      name: "natureOfBusiness",
      type: "textarea",
      required: true,
    },
    {
      name: "country",
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
    {
      name: "rejectionReason",
      type: "textarea",
      admin: {
        condition: (data, siblingData) => siblingData?.status === "REJECTED",
      },
    },
  ],
};

export default Applications;
