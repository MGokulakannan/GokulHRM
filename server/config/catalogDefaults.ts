// Optional starter data an Admin can load with one click from each list page.
// Loading never overwrites or duplicates existing entries.

const names = (...values: string[]) => values.map((name) => ({ name }));

export const nationalityDefaults = names(
  "Afghan", "American", "Argentine", "Australian", "Bangladeshi", "Belgian", "Brazilian",
  "British", "Canadian", "Chinese", "Danish", "Dutch", "Egyptian", "Emirati", "Filipino",
  "Finnish", "French", "German", "Ghanaian", "Greek", "Indian", "Indonesian", "Irish",
  "Israeli", "Italian", "Japanese", "Kenyan", "Korean", "Malaysian", "Mexican", "Nepalese",
  "New Zealander", "Nigerian", "Norwegian", "Pakistani", "Polish", "Portuguese", "Russian",
  "Saudi", "Singaporean", "South African", "Spanish", "Sri Lankan", "Swedish", "Swiss",
  "Thai", "Turkish", "Ukrainian", "Vietnamese"
);

export const languageDefaults = names(
  "English", "Tamil", "Hindi", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi",
  "Gujarati", "Urdu", "Spanish", "French", "German", "Arabic", "Chinese (Mandarin)",
  "Japanese", "Korean", "Portuguese", "Russian", "Italian"
);

export const jobCategoryDefaults = [
  "Officials and Managers", "Professionals", "Technicians", "Sales Workers",
  "Office and Clerical Workers", "Craft Workers", "Laborers and Helpers", "Service Workers",
].map((name) => ({ name }));

export const educationDefaults = names(
  "High School", "Diploma", "Bachelor's Degree", "Master's Degree", "Doctorate (PhD)",
  "Professional Certification"
);

export const skillDefaults = names(
  "Communication", "Leadership", "Project Management", "Problem Solving", "Teamwork",
  "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Data Analysis", "Customer Service"
);

export const licenseDefaults = names(
  "Project Management Professional (PMP)", "AWS Certified Solutions Architect",
  "Certified Public Accountant (CPA)", "Driving License", "First Aid Certificate"
);

export const membershipDefaults = names(
  "IEEE", "ACM", "Project Management Institute (PMI)", "SHRM", "Chamber of Commerce"
);
