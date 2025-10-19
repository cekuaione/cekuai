export const AI_MESSAGES = {
  welcome: "Merhaba! Ben senin kişisel antrenman koçunum. Sana özel bir program hazırlayacağım 💪",
  
  goal: "İlk soru: Antrenman hedefin ne?",
  goalConfirm: (goal: string) => `Harika seçim! ${goal} için mükemmel bir program yapacağız.`,
  
  level: "Şu anki fitness seviyen nedir?",
  levelConfirm: (level: string) => `Anladım, ${level} seviyesindesin. Buna göre ayarlayacağım.`,
  
  days: "Haftada kaç gün antrenman yapmak istiyorsun?",
  daysConfirm: (days: string) => `Tamam, haftada ${days} gün antrenman yapacağız.`,
  
  duration: "Antrenman başına ne kadar süre ayırabilirsin?",
  durationConfirm: (duration: string) => `Harika! ${duration} dakikalık antrenmanlar hazırlayacağım.`,
  
  equipment: "Hangi ekipmanlara sahipsin? Birden fazla seçebilirsin.",
  equipmentConfirm: (equipment: string[]) => 
    `Mükemmel! ${equipment.join(", ")} ile harika bir program yapacağız.`,
  
  notes: "Son bir soru: Özel bir notun var mı? (Sakatlık, özel durum vs.)",
  notesConfirm: (hasNotes: boolean) => 
    hasNotes ? "Anladım, bunları göz önünde bulunduracağım." : "Tamam, özel bir durum yok.",
  
  summary: (data: {
    goal: string;
    level: string;
    daysPerWeek: string;
    duration: string;
    equipment: string[];
    notes: string;
  }) => `
İşte seçimlerinin özeti:

🎯 Hedef: ${data.goal}
💪 Seviye: ${data.level}
📅 Haftalık Gün: ${data.daysPerWeek}
⏱️ Süre: ${data.duration} dakika
🏋️ Ekipman: ${data.equipment.join(", ")}
📝 Notlar: ${data.notes || "Yok"}

Onaylıyor musun?
  `.trim(),
  
  generating: "Programını hazırlıyorum... Bu 30-40 saniye sürebilir ⏳",
};

export const USER_OPTIONS = {
  goals: [
    "💪 Kas Yapma",
    "🔥 Yağ Yakma",
    "🏃 Dayanıklılık",
    "⚖️ Genel Fitness",
  ],
  
  levels: [
    "🌱 Yeni Başlayan",
    "🏋️ Orta Seviye",
    "💪 İleri Seviye",
  ],
  
  daysPerWeek: ["3", "4", "5", "6"],
  
  duration: ["30", "45", "60", "90"],
  
  equipment: [
    "Dambıl",
    "Barbell",
    "Kettlebell",
    "Direnç Bandı",
    "Pull-up Bar",
    "Sadece Vücut Ağırlığı",
  ],
};

