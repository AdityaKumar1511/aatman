/**
 * Helpline data, bundled into the client and the offline crisis page so it renders
 * with no network. Verify the national numbers before each release; campus numbers
 * come from the counselling cell.
 */

export interface LocalizedText {
  en: string;
  hi: string;
}

export interface Helpline {
  id: string;
  name: LocalizedText;
  /** Display form. */
  number: string;
  /** Digits only, for `tel:` links. */
  tel: string;
  alt?: { number: string; tel: string };
  hours: LocalizedText;
  description: LocalizedText;
}

const H24: LocalizedText = { en: "24×7, free", hi: "24×7, निःशुल्क" };

export const TELE_MANAS: Helpline = {
  id: "tele_manas",
  name: { en: "Tele-MANAS", hi: "टेली-मानस" },
  number: "14416",
  tel: "14416",
  alt: { number: "1-800-891-4416", tel: "18008914416" },
  hours: H24,
  description: {
    en: "Government of India mental health support, in many Indian languages.",
    hi: "भारत सरकार की मानसिक स्वास्थ्य सहायता, कई भारतीय भाषाओं में।",
  },
};

export const EMERGENCY_112: Helpline = {
  id: "emergency_112",
  name: { en: "Emergency", hi: "आपातकालीन सेवा" },
  number: "112",
  tel: "112",
  hours: H24,
  description: {
    en: "Police, ambulance, fire. Call if you or someone is in immediate danger.",
    hi: "पुलिस, एम्बुलेंस, अग्निशमन। अगर आप या कोई और तुरंत खतरे में है तो कॉल करें।",
  },
};

export const ICALL: Helpline = {
  id: "icall",
  name: { en: "iCall (TISS)", hi: "iCall (TISS)" },
  number: "9152987821",
  tel: "9152987821",
  hours: { en: "Mon–Sat, 10 AM – 8 PM", hi: "सोम–शनि, सुबह 10 – रात 8" },
  description: {
    en: "Free counselling by trained professionals.",
    hi: "प्रशिक्षित पेशेवरों द्वारा निःशुल्क परामर्श।",
  },
};

export const ANTI_RAGGING: Helpline = {
  id: "anti_ragging",
  name: { en: "National Anti-Ragging Helpline", hi: "राष्ट्रीय एंटी-रैगिंग हेल्पलाइन" },
  number: "1800-180-5522",
  tel: "18001805522",
  hours: H24,
  description: {
    en: "UGC helpline for reporting ragging. This app is not a reporting channel.",
    hi: "रैगिंग की शिकायत के लिए UGC हेल्पलाइन। यह ऐप शिकायत दर्ज करने का माध्यम नहीं है।",
  },
};

/**
 * Campus contacts are filled in by the counselling cell before the pilot.
 * Entries with `tel: null` are hidden, so no placeholder number ever ships.
 */
export const CAMPUS_CONTACTS: (Omit<Helpline, "number" | "tel"> & { number: string | null; tel: string | null })[] = [
  {
    id: "campus_counsellor",
    name: { en: "NITP Counsellor", hi: "NITP काउंसलर" },
    number: null,
    tel: null,
    hours: { en: "Working hours", hi: "कार्य समय" },
    description: {
      en: "Licensed counsellor on campus.",
      hi: "कैंपस में लाइसेंस प्राप्त काउंसलर।",
    },
  },
  {
    id: "campus_medical",
    name: { en: "NITP Medical Centre", hi: "NITP चिकित्सा केंद्र" },
    number: null,
    tel: null,
    hours: H24,
    description: {
      en: "Medical officer on duty.",
      hi: "ड्यूटी पर चिकित्सा अधिकारी।",
    },
  },
];

export function configuredCampusContacts(): Helpline[] {
  return CAMPUS_CONTACTS.filter((c): c is Helpline => c.tel !== null && c.number !== null);
}

/** Order matters: the first entry is the primary one-tap action on the crisis screen. */
export function crisisHelplines(): Helpline[] {
  return [TELE_MANAS, EMERGENCY_112, ...configuredCampusContacts(), ICALL];
}
