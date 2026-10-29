/**
 * Initial Seed Data for Medical Fund Platform
 */
const INITIAL_CAMPAIGNS = [
  {
    id: "med-001",
    title: "Urgent Heart Surgery for 5-Year-Old Aarav",
    patientName: "Aarav Sharma",
    patientAge: 5,
    gender: "Male",
    relationship: "Father raising funds",
    category: "Pediatric Cardiac",
    condition: "Tetralogy of Fallot (Congenital Heart Defect)",
    hospital: "Fortis Escorts Heart Institute, New Delhi",
    doctorName: "Dr. K. S. Iyer",
    city: "New Delhi, India",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    goalAmount: 18000,
    raisedAmount: 13650,
    donorCount: 284,
    daysLeft: 6,
    isUrgent: true,
    isVerified: true,
    verificationDetails: {
      hospitalVerified: true,
      billsVerified: true,
      doctorNoteVerified: true,
      hospitalRegNumber: "FEHI/CAR/2026/8941",
      letterDate: "2026-10-15"
    },
    story: `Little Aarav was born with a critical congenital heart defect known as Tetralogy of Fallot. At just 5 years old, even climbing five steps leaves his lips blue and his breathing labored. 

Last week, doctors advised that corrective intracardiac repair surgery must be completed within 14 days to prevent irreversible pulmonary artery damage. Aarav's father works as an elementary school teacher, and the family has exhausted all savings over two years of medical visits. Your support can give this vibrant young boy a chance to attend school and play like any normal child.`,
    costBreakdown: [
      { item: "Intracardiac Repair Surgery & Anesthesia", percentage: 50, amount: 9000 },
      { item: "Pediatric Cardiac ICU (7 Days)", percentage: 30, amount: 5400 },
      { item: "Post-operative Medications & Diagnostics", percentage: 20, amount: 3600 }
    ],
    updates: [
      {
        date: "2026-10-25",
        title: "Pre-surgery tests completed",
        description: "Aarav underwent pre-operative echo and blood profiling. Doctors are satisfied with his baseline vitals."
      },
      {
        date: "2026-10-20",
        title: "Campaign reached 60% milestone",
        description: "Thank you to every donor! We are coordinating the surgery date with Dr. Iyer's surgical team."
      }
    ],
    donors: [
      { name: "Sarah Jenkins", amount: 250, time: "2 hours ago", message: "Praying for little Aarav's swift recovery!", isAnonymous: false },
      { name: "Anonymous", amount: 500, time: "4 hours ago", message: "Stay strong family.", isAnonymous: true },
      { name: "Vikram Malhotra", amount: 100, time: "7 hours ago", message: "From one parent to another, stay brave.", isAnonymous: false },
      { name: "Dr. Elena Rostova", amount: 150, time: "1 day ago", message: "Get well soon, Aarav!", isAnonymous: false }
    ]
  },
  {
    id: "med-002",
    title: "Help Maria Beat Stage 3 Acute Lymphoblastic Leukemia",
    patientName: "Maria Santos",
    patientAge: 29,
    gender: "Female",
    relationship: "Self",
    category: "Cancer Care",
    condition: "Acute Lymphoblastic Leukemia (ALL)",
    hospital: "Memorial Sloan Kettering Cancer Center / Global Partner",
    doctorName: "Dr. Richard Chen",
    city: "Chicago, IL",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80",
    goalAmount: 45000,
    raisedAmount: 32800,
    donorCount: 412,
    daysLeft: 12,
    isUrgent: true,
    isVerified: true,
    verificationDetails: {
      hospitalVerified: true,
      billsVerified: true,
      doctorNoteVerified: true,
      hospitalRegNumber: "MSK-HEM-991204",
      letterDate: "2026-10-02"
    },
    story: `Maria is a 29-year-old nurse who spent the last 6 years tending to critical oncology patients. Two months ago, unexplained fatigue and recurrent fevers led to a bone marrow biopsy confirming Stage 3 Acute Lymphoblastic Leukemia.

Now, Maria is on the other side of the hospital bed. She needs intensive induction chemotherapy followed by a Targeted CAR-T cell infusion. While she has partial insurance, the experimental immunotherapy protocol requires substantial out-of-pocket funding. Let us support a caregiver in her own hour of need.`,
    costBreakdown: [
      { item: "Targeted Immunotherapy Infusion", percentage: 55, amount: 24750 },
      { item: "Inpatient Oncology & Neutropenic Care", percentage: 25, amount: 11250 },
      { item: "Specialized Laboratory & Genomic Panels", percentage: 20, amount: 9000 }
    ],
    updates: [
      {
        date: "2026-10-26",
        title: "Cycle 1 Chemotherapy Completed",
        description: "Maria is resting at home with managed side effects. The medical team is preparing the schedule for immunotherapy."
      }
    ],
    donors: [
      { name: "Nurse Association Group 4B", amount: 1200, time: "30 minutes ago", message: "We are with you every step Maria!", isAnonymous: false },
      { name: "Marcus Vance", amount: 50, time: "3 hours ago", message: "Fight on!", isAnonymous: false },
      { name: "Anonymous", amount: 300, time: "5 hours ago", message: "A gift of gratitude for your service.", isAnonymous: true }
    ]
  },
  {
    id: "med-003",
    title: "Emergency Brain Surgery After Severe Traffic Accident",
    patientName: "David O'Connor",
    patientAge: 38,
    gender: "Male",
    relationship: "Spouse (Clara O'Connor)",
    category: "Accident & Trauma",
    condition: "Traumatic Brain Injury & Subdural Hematoma",
    hospital: "St. Jude Metropolitan Trauma Center",
    doctorName: "Dr. Amanda Wright",
    city: "Boston, MA",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80",
    goalAmount: 35000,
    raisedAmount: 28950,
    donorCount: 368,
    daysLeft: 3,
    isUrgent: true,
    isVerified: true,
    verificationDetails: {
      hospitalVerified: true,
      billsVerified: true,
      doctorNoteVerified: true,
      hospitalRegNumber: "TRAUMA-EMG-7714",
      letterDate: "2026-10-24"
    },
    story: `On Sunday evening, David was cycling home from work when an out-of-control vehicle collided with him. He was rushed into emergency triage with multiple fractures and acute intracranial hemorrhage.

A neurosurgical team performed an emergency craniotomy to relieve cranial pressure. David is currently in a medically induced coma in the Neuro-ICU. Clara, his wife and mother to their 2-year-old twin girls, is facing overwhelming day-to-day ICU fees. Doctors are optimistic about his neurological reflexes if critical care is sustained.`,
    costBreakdown: [
      { item: "Emergency Craniotomy & Surgical Suite", percentage: 40, amount: 14000 },
      { item: "Neuro-Intensive Care Unit (14 Days)", percentage: 45, amount: 15750 },
      { item: "Ventilator Support & Brain Monitoring", percentage: 15, amount: 5250 }
    ],
    updates: [
      {
        date: "2026-10-28",
        title: "Swelling has stabilized",
        description: "Intracranial pressure sensors show normal ranges today. Doctors may begin weaning off the ventilator tomorrow."
      }
    ],
    donors: [
      { name: "Boston Cyclists Coalition", amount: 850, time: "1 hour ago", message: "Riding for David. Wishing for your recovery.", isAnonymous: false },
      { name: "The Gallagher Family", amount: 200, time: "6 hours ago", message: "Keeping Clara and the girls in our hearts.", isAnonymous: false },
      { name: "Anonymous", amount: 1000, time: "12 hours ago", message: "Blessings and strength.", isAnonymous: true }
    ]
  },
  {
    id: "med-004",
    title: "Support 12-Year-Old Liam's Kidney Transplant",
    patientName: "Liam Evans",
    patientAge: 12,
    gender: "Male",
    relationship: "Mother (Rachel Evans)",
    category: "Organ Transplant",
    condition: "End-Stage Renal Disease (ESRD)",
    hospital: "Great Ormond Pediatric Health Network",
    doctorName: "Dr. Alistair Finch",
    city: "London / Global Referral",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80",
    goalAmount: 50000,
    raisedAmount: 18400,
    donorCount: 195,
    daysLeft: 18,
    isUrgent: false,
    isVerified: true,
    verificationDetails: {
      hospitalVerified: true,
      billsVerified: true,
      doctorNoteVerified: true,
      hospitalRegNumber: "GOSH-RENAL-552",
      letterDate: "2026-10-18"
    },
    story: `Liam was diagnosed with focal segmental glomerulosclerosis at age 8. Despite ongoing therapies, his kidney function has dwindled to under 9%, requiring peritoneal dialysis 10 hours every night.

His mother Rachel has undergone screening and was confirmed as a compatible live donor match! The dual surgery is scheduled for mid-November. The funds will directly cover surgical hospitalization for both donor and recipient, organ preservation, and post-transplant immunosuppressive therapy for the first critical year.`,
    costBreakdown: [
      { item: "Dual Donor & Recipient Surgical Suites", percentage: 45, amount: 22500 },
      { item: "Post-Transplant Anti-Rejection Regimen", percentage: 30, amount: 15000 },
      { item: "Dialysis & Organ Transport Protocols", percentage: 25, amount: 12500 }
    ],
    updates: [
      {
        date: "2026-10-22",
        title: "Match testing 100% verified",
        description: "Tissue cross-match came back clear! Both surgeries have been tentatively booked for Nov 16."
      }
    ],
    donors: [
      { name: "St. Jude Parish Community", amount: 500, time: "3 hours ago", message: "Prayers from our congregation for Rachel and Liam.", isAnonymous: false },
      { name: "Emily Watson", amount: 75, time: "8 hours ago", message: "Sending so much love to brave Liam.", isAnonymous: false }
    ]
  },
  {
    id: "med-005",
    title: "Gene Therapy for Baby Amara's Spinal Muscular Atrophy",
    patientName: "Amara Gomez",
    patientAge: 1.5,
    gender: "Female",
    relationship: "Parents (Carlos & Sofia)",
    category: "Rare Diseases",
    condition: "Spinal Muscular Atrophy (SMA Type 1)",
    hospital: "Children's National Hospital",
    doctorName: "Dr. Teresa Mendez",
    city: "San Diego, CA",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80",
    goalAmount: 85000,
    raisedAmount: 64200,
    donorCount: 890,
    daysLeft: 9,
    isUrgent: true,
    isVerified: true,
    verificationDetails: {
      hospitalVerified: true,
      billsVerified: true,
      doctorNoteVerified: true,
      hospitalRegNumber: "CNH-GENE-4019",
      letterDate: "2026-10-10"
    },
    story: `SMA Type 1 is a rare genetic disorder that rapidly destroys motor neurons controlling breathing and swallowing. Without treatment, most infants do not survive past age two.

A breakthrough one-time gene therapy replacement can stop disease progression and save Amara's life, but it must be administered before she reaches age two (in just 5 months). The family has secured partial manufacturer assistance and co-pay relief, but the remaining clinic infusion expense stands at $85,000. Every single dollar brings Amara closer to this miracle treatment.`,
    costBreakdown: [
      { item: "Specialized Gene Vector Clinical Infusion", percentage: 65, amount: 55250 },
      { item: "Respiratory & Motor Physical Therapy", percentage: 20, amount: 17000 },
      { item: "Pediatric Intensive Monitoring & Neurological Scans", percentage: 15, amount: 12750 }
    ],
    updates: [
      {
        date: "2026-10-27",
        title: "Passed clinical antibody screening",
        description: "Amara tested negative for AAV9 antibodies, confirming she is 100% eligible for the infusion once funds are cleared."
      }
    ],
    donors: [
      { name: "Hope For Rare Diseases Foundation", amount: 5000, time: "5 hours ago", message: "Matching challenge contribution. Save Amara!", isAnonymous: false },
      { name: "Anonymous", amount: 200, time: "9 hours ago", message: "Sweet baby girl, keep smiling.", isAnonymous: true },
      { name: "Lucas Vance", amount: 100, time: "1 day ago", message: "Stay strong Carlos & Sofia.", isAnonymous: false }
    ]
  },
  {
    id: "med-006",
    title: "Cochlear Implants for Twins Noah and Maya",
    patientName: "Noah & Maya Lin",
    patientAge: 3,
    gender: "Twin Toddlers",
    relationship: "Parents (Kevin & Jenny)",
    category: "Pediatric Cardiac",
    condition: "Congenital Bilateral Sensorineural Hearing Loss",
    hospital: "Singapore General Hospital Pediatric ENT",
    doctorName: "Dr. Wei Xiang Tan",
    city: "Singapore / Regional",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
    goalAmount: 26000,
    raisedAmount: 14200,
    donorCount: 164,
    daysLeft: 22,
    isUrgent: false,
    isVerified: true,
    verificationDetails: {
      hospitalVerified: true,
      billsVerified: true,
      doctorNoteVerified: true,
      hospitalRegNumber: "SGH-ENT-2026-302",
      letterDate: "2026-10-20"
    },
    story: `Twins Noah and Maya were diagnosed with profound bilateral hearing loss at 18 months. Audiologists strongly recommend bilateral cochlear implantation before age 4 during the critical window for language and cognitive development.

Both parents are working hard to support their children, but double implantation for twins exceeds their annual income. These implants will allow Noah and Maya to hear their parents' voices and laughter for the very first time.`,
    costBreakdown: [
      { item: "Bilateral Cochlear Hardware & Sound Processors", percentage: 60, amount: 15600 },
      { item: "Microsurgery & Operating Theatre Fees", percentage: 25, amount: 6500 },
      { item: "Auditory-Verbal Speech Therapy (12 Months)", percentage: 15, amount: 3900 }
    ],
    updates: [
      {
        date: "2026-10-24",
        title: "Audiology mapping completed",
        description: "The clinic confirmed candidacy for the low-profile implants. Ready for surgery scheduling."
      }
    ],
    donors: [
      { name: "Friends of Sound Foundation", amount: 1000, time: "1 day ago", message: "May both children thrive with sound and music.", isAnonymous: false },
      { name: "Darren Koh", amount: 150, time: "2 days ago", message: "Cheering for you, Noah & Maya!", isAnonymous: false }
    ]
  }
];

// Categories definition
const CATEGORIES = [
  { id: "all", name: "All Fundraisers", icon: "activity" },
  { id: "urgent", name: "Emergency Cases", icon: "alert-circle", filterFn: c => c.isUrgent },
  { id: "Cancer Care", name: "Cancer Care", icon: "heart-pulse" },
  { id: "Pediatric Cardiac", name: "Child Health & Heart", icon: "baby" },
  { id: "Accident & Trauma", name: "Accident & Trauma", icon: "ambulance" },
  { id: "Organ Transplant", name: "Organ Transplant", icon: "shield-plus" },
  { id: "Rare Diseases", name: "Rare Diseases", icon: "dna" }
];

// Currency exchange rates relative to USD (1 USD = ...)
const CURRENCIES = {
  USD: { symbol: "$", code: "USD", rate: 1.0, label: "USD ($)" },
  INR: { symbol: "₹", code: "INR", rate: 84.0, label: "INR (₹)" },
  EUR: { symbol: "€", code: "EUR", rate: 0.92, label: "EUR (€)" },
  GBP: { symbol: "£", code: "GBP", rate: 0.77, label: "GBP (£)" }
];
