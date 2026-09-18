const fs = require('fs');
const path = require('path');

const tenders = [
  {
    id: "AO-2023-01",
    title: "Construction d'un centre de santé rural",
    title_ar: "بناء مركز صحي قروي",
    title_en: "Construction of a rural health center",
    buyer: "Ministère de la Santé",
    buyer_ar: "وزارة الصحة",
    buyer_en: "Ministry of Health",
    city: "Taza",
    city_ar: "تازة",
    city_en: "Taza",
    deadline: "2023-11-15T10:00:00Z",
    estimatedCost: 2500000,
    category: "Travaux",
    category_ar: "أشغال",
    category_en: "Works",
    description: "Travaux de construction d'un centre de santé rural niveau 1 avec logement de fonction à Taza.",
    description_ar: "أشغال بناء مركز صحي قروي من المستوى الأول مع سكن وظيفي في تازة.",
    description_en: "Construction work for a level 1 rural health center with staff housing in Taza."
  },
  {
    id: "AO-2023-02",
    title: "Acquisition de matériel informatique",
    title_ar: "اقتناء معدات معلوماتية",
    title_en: "Acquisition of IT equipment",
    buyer: "Université Mohammed V",
    buyer_ar: "جامعة محمد الخامس",
    buyer_en: "Mohammed V University",
    city: "Rabat",
    city_ar: "الرباط",
    city_en: "Rabat",
    deadline: "2023-11-20T14:30:00Z",
    estimatedCost: 850000,
    category: "Fournitures",
    category_ar: "توريدات",
    category_en: "Supplies",
    description: "Acquisition, installation et mise en service de matériel informatique (PC portables, serveurs) pour l'université.",
    description_ar: "اقتناء، تركيب وتشغيل معدات معلوماتية (حواسيب محمولة، خوادم) لفائدة الجامعة.",
    description_en: "Acquisition, installation, and commissioning of IT equipment (laptops, servers) for the university."
  },
  {
    id: "AO-2023-03",
    title: "Services de nettoyage et d'entretien",
    title_ar: "خدمات النظافة والصيانة",
    title_en: "Cleaning and maintenance services",
    buyer: "ONCF",
    buyer_ar: "المكتب الوطني للسكك الحديدية",
    buyer_en: "ONCF",
    city: "Casablanca",
    city_ar: "الدار البيضاء",
    city_en: "Casablanca",
    deadline: "2023-11-18T10:00:00Z",
    estimatedCost: 1200000,
    category: "Services",
    category_ar: "خدمات",
    category_en: "Services",
    description: "Prestation de nettoyage et d'entretien des locaux administratifs de l'ONCF à Casablanca.",
    description_ar: "تقديم خدمات النظافة وصيانة المكاتب الإدارية للمكتب الوطني للسكك الحديدية بالدار البيضاء.",
    description_en: "Cleaning and maintenance services for ONCF administrative offices in Casablanca."
  }
];

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

fs.writeFileSync(path.join(dataDir, 'tenders.json'), JSON.stringify(tenders, null, 2));
console.log('Tenders data generated successfully!');
