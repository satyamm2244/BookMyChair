// Real Supabase IDs from Satyam's backend

export const SERVICE_IDS = {
  haircut: 'd015be4f-c11b-4c64-a1af-95511e9afde0',
  facial: 'e619bf95-86a0-4507-a944-aa41daeccbff',
  hairSpa: '9814f8dd-af20-4f03-ab13-7ceb184ab246',
  beardTrim: '01d9590f-2c58-4944-8161-8f9ff6135562',
} as const;

export const STYLIST_IDS = {
  aman: '7c33d319-cc15-4d92-8eee-d0d40fab8105',
  rohit: '70b509c1-453a-4641-ac04-8321e4693ef0',
} as const;

export const SERVICE_NAMES: Record<string, string> = {
  [SERVICE_IDS.haircut]: 'Haircut',
  [SERVICE_IDS.facial]: 'Facial',
  [SERVICE_IDS.hairSpa]: 'Hair Spa',
  [SERVICE_IDS.beardTrim]: 'Beard Trim',
};

export const DEMO_CUSTOMER = {
  name: 'Arghyarupa Mishra',
  phone: '9999999998',
};
