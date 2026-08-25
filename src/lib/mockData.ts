import { Teacher, AttendanceLog, SubstitutionLog, ScheduleSlot, DayOfWeek } from './types';
import { getDaysAgo, getTodayString, DAYS_OF_WEEK } from './utils';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'Emel Yıldırım',
    branch: 'Rehberlik ve Psikolojik Danışmanlık',
    level: 'Ortaokul',
    phone: '0555 101 0001',
    email: 'emel.yildirim@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 't-2',
    name: 'Başak Pınarbaşı',
    branch: 'Türkçe & Edebiyat',
    level: 'Ortaokul',
    phone: '0555 102 0002',
    email: 'basak.pinarbasi@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 't-3',
    name: 'Merve Kalyoncuoğlu',
    branch: 'Türkçe & Edebiyat',
    level: 'Ortaokul',
    phone: '0555 103 0003',
    email: 'merve.kalyoncuoglu@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: 't-4',
    name: 'Koray Han',
    branch: 'Matematik',
    level: 'Ortaokul',
    phone: '0555 104 0004',
    email: 'koray.han@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-11',
  },
  {
    id: 't-5',
    name: 'Sevdanur İşçi',
    branch: 'Matematik',
    level: 'Ortaokul',
    phone: '0555 105 0005',
    email: 'sevdanur.isci@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-11',
  },
  {
    id: 't-6',
    name: 'Dilara Ekşioğlu',
    branch: 'Fen Bilimleri',
    level: 'Ortaokul',
    phone: '0555 106 0006',
    email: 'dilara.eksioglu@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-12',
  },
  {
    id: 't-7',
    name: 'Dolunay Yaşar',
    branch: 'Fen Bilimleri',
    level: 'Ortaokul',
    phone: '0555 107 0007',
    email: 'dolunay.yasar@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-12',
  },
  {
    id: 't-8',
    name: 'Gizem Örgüt',
    branch: 'Sosyal Bilgiler',
    level: 'Ortaokul',
    phone: '0555 108 0008',
    email: 'gizem.orgut@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-13',
  },
  {
    id: 't-9',
    name: 'Aysel Gökçe',
    branch: 'Din Kültürü ve Ahlak Bilgisi',
    level: 'Ortaokul',
    phone: '0555 109 0009',
    email: 'aysel.gokce@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-13',
  },
  {
    id: 't-10',
    name: 'Nur Öykü Ürgüp',
    branch: 'İngilizce',
    level: 'Ortaokul',
    phone: '0555 110 0010',
    email: 'nur.urgup@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-14',
  },
  {
    id: 't-11',
    name: 'Zeynep Özbağ',
    branch: 'İngilizce',
    level: 'Ortaokul',
    phone: '0555 111 0011',
    email: 'zeynep.ozbag@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-14',
  },
  {
    id: 't-12',
    name: 'Arman Yıldız',
    branch: 'İngilizce',
    level: 'Ortaokul',
    phone: '0555 112 0012',
    email: 'arman.yildiz@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 't-13',
    name: 'Emel Günoral',
    branch: 'Almanca',
    level: 'Ortaokul',
    phone: '0555 113 0013',
    email: 'emel.gunoral@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 't-14',
    name: 'Çağatay Hancı',
    branch: 'Bilişim Teknolojileri',
    level: 'Ortaokul',
    phone: '0555 114 0014',
    email: 'cagatay.hanci@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-16',
  },
  {
    id: 't-15',
    name: 'Banu Yılmaz',
    branch: 'Müzik',
    level: 'Ortaokul',
    phone: '0555 115 0015',
    email: 'banu.yilmaz@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-16',
  },
  {
    id: 't-16',
    name: 'Nurdanur Okkay',
    branch: 'Beden Eğitimi ve Spor',
    level: 'Ortaokul',
    phone: '0555 116 0016',
    email: 'nurdanur.okkay@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-17',
  },
  {
    id: 't-17',
    name: 'Barış Kuruçay',
    branch: 'Müzik',
    level: 'Ortaokul',
    phone: '0555 117 0017',
    email: 'baris.kurucay@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-17',
  },
  {
    id: 't-18',
    name: 'Ebubekir Taş',
    branch: 'Beden Eğitimi ve Spor',
    level: 'Ortaokul',
    phone: '0555 118 0018',
    email: 'ebubekir.tas@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-18',
  },
  {
    id: 't-19',
    name: 'Aysu Naz Yıldız',
    branch: 'Görsel Sanatlar',
    level: 'Ortaokul',
    phone: '0555 119 0019',
    email: 'aysu.yildiz@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-18',
  },
  {
    id: 't-20',
    name: 'Jermain Wilmer Lumbuku',
    branch: 'İngilizce',
    level: 'Ortaokul',
    phone: '0555 120 0020',
    email: 'jermain.lumbuku@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-19',
  },
  {
    id: 't-21',
    name: 'Selçuk Aksoy',
    branch: 'Müzik',
    level: 'Ortaokul',
    phone: '0555 121 0021',
    email: 'selcuk.aksoy@okul.k12.tr',
    isActive: true,
    createdAt: '2024-01-19',
  }
];

export function generateInitialLogs(): { attendance: AttendanceLog[]; substitutions: SubstitutionLog[] } {
  const attendance: AttendanceLog[] = [];
  const substitutions: SubstitutionLog[] = [];
  const today = getTodayString();

  const days = [
    getDaysAgo(0),
    getDaysAgo(1),
    getDaysAgo(2),
    getDaysAgo(3),
    getDaysAgo(4),
  ];

  days.forEach((date, dayIdx) => {
    INITIAL_TEACHERS.forEach((teacher) => {
      let status: AttendanceLog['status'] = 'geldi';
      let lateMinutes = 0;
      let note = '';

      if (date === today) {
        if (teacher.id === 't-4') { // Koray Han
          status = 'mazeretli';
          note = 'Sağlık Raporu (Hastanede randevu)';
        } else if (teacher.id === 't-6') { // Dilara Ekşioğlu
          status = 'gec';
          lateMinutes = 20;
          note = 'Trafik yoğunluğu';
        } else if (teacher.id === 't-13') { // Emel Günoral
          status = 'mazeretsiz';
          note = 'Haber verilmedi';
        } else {
          status = 'geldi';
        }
      } else if (dayIdx === 1) {
        if (teacher.id === 't-2') { // Başak Pınarbaşı
          status = 'mazeretli';
          note = 'İl Milli Eğitim Semineri';
        } else if (teacher.id === 't-7') { // Dolunay Yaşar
          status = 'gec';
          lateMinutes = 15;
        }
      }

      attendance.push({
        id: `att-${date}-${teacher.id}`,
        teacherId: teacher.id,
        date,
        status,
        lateMinutes: status === 'gec' ? lateMinutes : undefined,
        note: note || undefined,
        updatedAt: `${date}T08:00:00.000Z`,
      });
    });
  });

  // Substitutions
  substitutions.push(
    {
      id: 'sub-1',
      absentTeacherId: 't-4', // Koray Han
      substituteTeacherId: 't-5', // Sevdanur İşçi
      date: today,
      lessonHour: 1,
      classInfo: '7/A (MATEMATİK)',
      note: 'Problem çözümü yapıldı',
      createdAt: `${today}T08:50:00.000Z`,
    },
    {
      id: 'sub-2',
      absentTeacherId: 't-4', // Koray Han
      substituteTeacherId: 't-5', // Sevdanur İşçi
      date: today,
      lessonHour: 2,
      classInfo: '7/A (MATEMATİK)',
      note: 'Konu tekrarı yapıldı',
      createdAt: `${today}T09:50:00.000Z`,
    },
    {
      id: 'sub-3',
      absentTeacherId: 't-2', // Başak Pınarbaşı
      substituteTeacherId: 't-3', // Merve Kalyoncuoğlu
      date: getDaysAgo(1),
      lessonHour: 1,
      classInfo: '5/A (TÜRKÇE)',
      note: 'Ders dolduruldu',
      createdAt: `${getDaysAgo(1)}T08:50:00.000Z`,
    }
  );

  return { attendance, substitutions };
}

export function generateInitialScheduleSlots(): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];

  // Helper function to add slot with NO duty by default
  const set = (teacherId: string, day: DayOfWeek, hour: number, classInfo: string) => {
    slots.push({
      teacherId,
      day,
      lessonHour: hour,
      classInfo: classInfo.trim(),
      isDutyDay: false, // NO DUTY ASSIGNED BY DEFAULT
    });
  };

  // 1. EMEL YILDIRIM (t-1)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) set('t-1', d, h, '');
  });

  // 2. BAŞAK PINARBAŞI (t-2)
  set('t-2', 'Pazartesi', 1, '');
  set('t-2', 'Pazartesi', 2, '');
  set('t-2', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-2', 'Pazartesi', 4, '');
  set('t-2', 'Pazartesi', 5, '5/B (DOKAP)');
  set('t-2', 'Pazartesi', 6, '');
  set('t-2', 'Pazartesi', 7, '6/A (DOKAP)');
  set('t-2', 'Pazartesi', 8, '7/A (DOKAP)');

  set('t-2', 'Salı', 1, '5/A (TÜRKÇE)');
  set('t-2', 'Salı', 2, '5/A (TÜRKÇE)');
  set('t-2', 'Salı', 3, '');
  set('t-2', 'Salı', 4, '7/B (TÜRKÇE)');
  set('t-2', 'Salı', 5, '7/B (TÜRKÇE)');
  set('t-2', 'Salı', 6, '5/A (YAZMA ATÖLYESİ)');
  set('t-2', 'Salı', 7, '');
  set('t-2', 'Salı', 8, '5/B (YAZMA ATÖLYESİ)');

  set('t-2', 'Çarşamba', 1, '5/B (TÜRKÇE)');
  set('t-2', 'Çarşamba', 2, '5/B (TÜRKÇE)');
  set('t-2', 'Çarşamba', 3, '');
  set('t-2', 'Çarşamba', 4, '7/B (DOKAP)');
  set('t-2', 'Çarşamba', 5, '');
  set('t-2', 'Çarşamba', 6, '7/A (TÜRKÇE)');
  set('t-2', 'Çarşamba', 7, '7/A (TÜRKÇE)');
  set('t-2', 'Çarşamba', 8, '');

  set('t-2', 'Perşembe', 1, '7/A (TÜRKÇE)');
  set('t-2', 'Perşembe', 2, '7/A (TÜRKÇE)');
  set('t-2', 'Perşembe', 3, '6/B (DOKAP)');
  set('t-2', 'Perşembe', 4, '5/A (DOKAP)');
  set('t-2', 'Perşembe', 5, '');
  set('t-2', 'Perşembe', 6, '');
  set('t-2', 'Perşembe', 7, '');
  set('t-2', 'Perşembe', 8, '');

  set('t-2', 'Cuma', 1, '5/A (TÜRKÇE)');
  set('t-2', 'Cuma', 2, '5/A (TÜRKÇE)');
  set('t-2', 'Cuma', 3, '');
  set('t-2', 'Cuma', 4, '');
  set('t-2', 'Cuma', 5, '5/B (TÜRKÇE)');
  set('t-2', 'Cuma', 6, '5/B (TÜRKÇE)');
  set('t-2', 'Cuma', 7, '7/B (TÜRKÇE)');
  set('t-2', 'Cuma', 8, '7/B (TÜRKÇE)');

  // 3. MERVE KALYONCUOĞLU (t-3)
  set('t-3', 'Pazartesi', 1, '8/B (TÜRKÇE)');
  set('t-3', 'Pazartesi', 2, '8/B (TÜRKÇE)');
  set('t-3', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-3', 'Pazartesi', 4, '');
  set('t-3', 'Pazartesi', 5, '');
  set('t-3', 'Pazartesi', 6, '');
  set('t-3', 'Pazartesi', 7, '8/A (TÜRKÇE)');
  set('t-3', 'Pazartesi', 8, '8/A (TÜRKÇE)');

  set('t-3', 'Salı', 1, '');
  set('t-3', 'Salı', 2, '');
  set('t-3', 'Salı', 3, '6/B (TÜRKÇE)');
  set('t-3', 'Salı', 4, '6/B (TÜRKÇE)');
  set('t-3', 'Salı', 5, '');
  set('t-3', 'Salı', 6, '6/B (YAZMA ATÖLYESİ)');
  set('t-3', 'Salı', 7, '8/B (TÜRKÇE)');
  set('t-3', 'Salı', 8, '8/B (TÜRKÇE)');

  set('t-3', 'Çarşamba', 1, '6/A (YAZMA ATÖLYESİ)');
  set('t-3', 'Çarşamba', 2, '6/A (YAZMA ATÖLYESİ)');
  set('t-3', 'Çarşamba', 3, '');
  set('t-3', 'Çarşamba', 4, '');
  set('t-3', 'Çarşamba', 5, '8/A (TÜRKÇE)');
  set('t-3', 'Çarşamba', 6, '8/A (TÜRKÇE)');
  set('t-3', 'Çarşamba', 7, '');
  set('t-3', 'Çarşamba', 8, '');

  set('t-3', 'Perşembe', 1, '6/A (TÜRKÇE)');
  set('t-3', 'Perşembe', 2, '6/A (TÜRKÇE)');
  set('t-3', 'Perşembe', 3, '8/B (TÜRKÇE)');
  set('t-3', 'Perşembe', 4, '8/B (TÜRKÇE)');
  set('t-3', 'Perşembe', 5, '');
  set('t-3', 'Perşembe', 6, '8/A (TÜRKÇE)');
  set('t-3', 'Perşembe', 7, '8/A (TÜRKÇE)');
  set('t-3', 'Perşembe', 8, '');

  set('t-3', 'Cuma', 1, '8/B (TÜRKÇE)');
  set('t-3', 'Cuma', 2, '8/B (TÜRKÇE)');
  set('t-3', 'Cuma', 3, '6/A (TÜRKÇE)');
  set('t-3', 'Cuma', 4, '6/A (TÜRKÇE)');
  set('t-3', 'Cuma', 5, '');
  set('t-3', 'Cuma', 6, '8/A (TÜRKÇE)');
  set('t-3', 'Cuma', 7, '6/B (TÜRKÇE)');
  set('t-3', 'Cuma', 8, '6/B (TÜRKÇE)');

  // 4. KORAY HAN (t-4)
  set('t-4', 'Pazartesi', 1, '7/A (MATEMATİK)');
  set('t-4', 'Pazartesi', 2, '7/A (MATEMATİK)');
  set('t-4', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-4', 'Pazartesi', 4, '7/B (MATEMATİK)');
  set('t-4', 'Pazartesi', 5, '7/B (MATEMATİK)');
  set('t-4', 'Pazartesi', 6, '8/A (MATEMATİK)');
  set('t-4', 'Pazartesi', 7, '');
  set('t-4', 'Pazartesi', 8, '');

  set('t-4', 'Salı', 1, '8/B (MATEMATİK)');
  set('t-4', 'Salı', 2, '8/B (MATEMATİK)');
  set('t-4', 'Salı', 3, '');
  set('t-4', 'Salı', 4, '');
  set('t-4', 'Salı', 5, '8/A (MATEMATİK)');
  set('t-4', 'Salı', 6, '8/A (MATEMATİK)');
  set('t-4', 'Salı', 7, '');
  set('t-4', 'Salı', 8, '');

  set('t-4', 'Çarşamba', 1, '8/A (MATEMATİK)');
  set('t-4', 'Çarşamba', 2, '8/A (MATEMATİK)');
  set('t-4', 'Çarşamba', 3, '8/B (MATEMATİK)');
  set('t-4', 'Çarşamba', 4, '8/B (MATEMATİK)');
  set('t-4', 'Çarşamba', 5, '');
  set('t-4', 'Çarşamba', 6, '');
  set('t-4', 'Çarşamba', 7, '7/B (MATEMATİK)');
  set('t-4', 'Çarşamba', 8, '7/B (MATEMATİK)');

  set('t-4', 'Perşembe', 1, '8/B (MATEMATİK)');
  set('t-4', 'Perşembe', 2, '8/B (MATEMATİK)');
  set('t-4', 'Perşembe', 3, '8/A (MATEMATİK)');
  set('t-4', 'Perşembe', 4, '8/A (MATEMATİK)');
  set('t-4', 'Perşembe', 5, '7/A (MATEMATİK)');
  set('t-4', 'Perşembe', 6, '7/A (MATEMATİK)');
  set('t-4', 'Perşembe', 7, '');
  set('t-4', 'Perşembe', 8, '');

  set('t-4', 'Cuma', 1, '7/B (MATEMATİK)');
  set('t-4', 'Cuma', 2, '7/B (MATEMATİK)');
  set('t-4', 'Cuma', 3, '7/A (MATEMATİK)');
  set('t-4', 'Cuma', 4, '7/A (MATEMATİK)');
  set('t-4', 'Cuma', 5, '');
  set('t-4', 'Cuma', 6, '');
  set('t-4', 'Cuma', 7, '8/B (MATEMATİK)');
  set('t-4', 'Cuma', 8, '8/A (MATEMATİK)');

  // 5. SEVDANUR İŞÇİ (t-5)
  set('t-5', 'Pazartesi', 1, '6/B (MATEMATİK)');
  set('t-5', 'Pazartesi', 2, '6/B (MATEMATİK)');
  set('t-5', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-5', 'Pazartesi', 4, '6/A (AKIL OYUNLARI)');
  set('t-5', 'Pazartesi', 5, '');
  set('t-5', 'Pazartesi', 6, '5/B (MATEMATİK)');
  set('t-5', 'Pazartesi', 7, '5/B (MATEMATİK)');
  set('t-5', 'Pazartesi', 8, '');

  set('t-5', 'Salı', 1, '7/B (AKIL OYUNLARI)');
  set('t-5', 'Salı', 2, '7/B (AKIL OYUNLARI)');
  set('t-5', 'Salı', 3, '6/A (MATEMATİK)');
  set('t-5', 'Salı', 4, '6/A (MATEMATİK)');
  set('t-5', 'Salı', 5, '');
  set('t-5', 'Salı', 6, '');
  set('t-5', 'Salı', 7, '5/B (MATEMATİK)');
  set('t-5', 'Salı', 8, '5/B (MATEMATİK)');

  set('t-5', 'Çarşamba', 1, '5/A (MATEMATİK)');
  set('t-5', 'Çarşamba', 2, '5/A (MATEMATİK)');
  set('t-5', 'Çarşamba', 3, '');
  set('t-5', 'Çarşamba', 4, '');
  set('t-5', 'Çarşamba', 5, '');
  set('t-5', 'Çarşamba', 6, '');
  set('t-5', 'Çarşamba', 7, '6/B (AKIL OYUNLARI)');
  set('t-5', 'Çarşamba', 8, '6/B (AKIL OYUNLARI)');

  set('t-5', 'Perşembe', 1, '5/A (MATEMATİK)');
  set('t-5', 'Perşembe', 2, '5/A (MATEMATİK)');
  set('t-5', 'Perşembe', 3, '');
  set('t-5', 'Perşembe', 4, '7/A (AKIL OYUNLARI)');
  set('t-5', 'Perşembe', 5, '');
  set('t-5', 'Perşembe', 6, '6/A (MATEMATİK)');
  set('t-5', 'Perşembe', 7, '6/A (MATEMATİK)');
  set('t-5', 'Perşembe', 8, '');

  set('t-5', 'Cuma', 1, '5/B (MATEMATİK)');
  set('t-5', 'Cuma', 2, '5/B (MATEMATİK)');
  set('t-5', 'Cuma', 3, '6/B (MATEMATİK)');
  set('t-5', 'Cuma', 4, '6/B (MATEMATİK)');
  set('t-5', 'Cuma', 5, '5/A (MATEMATİK)');
  set('t-5', 'Cuma', 6, '5/A (MATEMATİK)');
  set('t-5', 'Cuma', 7, '');
  set('t-5', 'Cuma', 8, '');

  // 6. DİLARA EKŞİOĞLU (t-6)
  set('t-6', 'Pazartesi', 1, '5/A (FEN BİLGİSİ)');
  set('t-6', 'Pazartesi', 2, '5/A (FEN BİLGİSİ)');
  set('t-6', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-6', 'Pazartesi', 4, '7/A (FEN BİLGİSİ)');
  set('t-6', 'Pazartesi', 5, '7/A (FEN BİLGİSİ)');
  set('t-6', 'Pazartesi', 6, '');
  set('t-6', 'Pazartesi', 7, '');
  set('t-6', 'Pazartesi', 8, '');

  set('t-6', 'Salı', 1, '7/A (FEN BİLGİSİ)');
  set('t-6', 'Salı', 2, '7/A (FEN BİLGİSİ)');
  set('t-6', 'Salı', 3, '');
  set('t-6', 'Salı', 4, '');
  set('t-6', 'Salı', 5, '');
  set('t-6', 'Salı', 6, '7/B (FEN BİLGİSİ)');
  set('t-6', 'Salı', 7, '7/B (FEN BİLGİSİ)');
  set('t-6', 'Salı', 8, '');

  set('t-6', 'Çarşamba', 1, '');
  set('t-6', 'Çarşamba', 2, '');
  set('t-6', 'Çarşamba', 3, '5/B (FEN BİLGİSİ)');
  set('t-6', 'Çarşamba', 4, '5/B (FEN BİLGİSİ)');
  set('t-6', 'Çarşamba', 5, '7/B (FEN BİLGİSİ)');
  set('t-6', 'Çarşamba', 6, '7/B (FEN BİLGİSİ)');
  set('t-6', 'Çarşamba', 7, '');
  set('t-6', 'Çarşamba', 8, '6/B (DOĞA VE MÜH. BİLİMLERİ)');

  set('t-6', 'Perşembe', 1, '5/B (DOĞA VE MÜH. BİLİMLERİ)');
  set('t-6', 'Perşembe', 2, '5/B (FEN BİLGİSİ)');
  set('t-6', 'Perşembe', 3, '');
  set('t-6', 'Perşembe', 4, '6/A (DOĞA VE MÜH. BİLİMLERİ)');
  set('t-6', 'Perşembe', 5, '');
  set('t-6', 'Perşembe', 6, '');
  set('t-6', 'Perşembe', 7, '5/A (FEN BİLGİSİ)');
  set('t-6', 'Perşembe', 8, '5/A (DOĞA VE MÜH. BİLİMLERİ)');

  set('t-6', 'Cuma', 1, '');
  set('t-6', 'Cuma', 2, '8/A/8/B (LGS SINAV)');
  set('t-6', 'Cuma', 3, '8/A/8/B (LGS SINAV)');
  set('t-6', 'Cuma', 4, '8/A/8/B (LGS SINAV)');
  set('t-6', 'Cuma', 5, '8/A/8/B (LGS SINAV)');
  set('t-6', 'Cuma', 6, '');
  set('t-6', 'Cuma', 7, '');
  set('t-6', 'Cuma', 8, '');

  // 7. DOLUNAY YAŞAR (t-7)
  set('t-7', 'Pazartesi', 1, '8/A (FEN BİLGİSİ)');
  set('t-7', 'Pazartesi', 2, '8/A (FEN BİLGİSİ)');
  set('t-7', 'Pazartesi', 3, '8/B (FEN BİLGİSİ)');
  set('t-7', 'Pazartesi', 4, '8/B (FEN BİLGİSİ)');
  set('t-7', 'Pazartesi', 5, '');
  set('t-7', 'Pazartesi', 6, '');
  set('t-7', 'Pazartesi', 7, '');
  set('t-7', 'Pazartesi', 8, '6/B (FEN BİLGİSİ)');

  set('t-7', 'Salı', 1, '6/B (FEN BİLGİSİ)');
  set('t-7', 'Salı', 2, '6/B (FEN BİLGİSİ)');
  set('t-7', 'Salı', 3, '8/A (FEN BİLGİSİ)');
  set('t-7', 'Salı', 4, '8/A (FEN BİLGİSİ)');
  set('t-7', 'Salı', 5, '');
  set('t-7', 'Salı', 6, '');
  set('t-7', 'Salı', 7, '6/A (FEN BİLGİSİ)');
  set('t-7', 'Salı', 8, '6/A (FEN BİLGİSİ)');

  set('t-7', 'Çarşamba', 1, '8/B (FEN BİLGİSİ)');
  set('t-7', 'Çarşamba', 2, '8/B (FEN BİLGİSİ)');
  set('t-7', 'Çarşamba', 3, '');
  set('t-7', 'Çarşamba', 4, '');
  set('t-7', 'Çarşamba', 5, '');
  set('t-7', 'Çarşamba', 6, '');
  set('t-7', 'Çarşamba', 7, '8/A (FEN BİLGİSİ)');
  set('t-7', 'Çarşamba', 8, '8/A (FEN BİLGİSİ)');

  set('t-7', 'Perşembe', 1, '');
  set('t-7', 'Perşembe', 2, '');
  set('t-7', 'Perşembe', 3, '6/A (FEN BİLGİSİ)');
  set('t-7', 'Perşembe', 4, '6/A (FEN BİLGİSİ)');
  set('t-7', 'Perşembe', 5, '');
  set('t-7', 'Perşembe', 6, '');
  set('t-7', 'Perşembe', 7, '8/B (FEN BİLGİSİ)');
  set('t-7', 'Perşembe', 8, '8/B (FEN BİLGİSİ)');

  set('t-7', 'Cuma', 1, '');
  set('t-7', 'Cuma', 2, '8/A/8/B (LGS SINAV)');
  set('t-7', 'Cuma', 3, '8/A/8/B (LGS SINAV)');
  set('t-7', 'Cuma', 4, '8/A/8/B (LGS SINAV)');
  set('t-7', 'Cuma', 5, '8/A/8/B (LGS SINAV)');
  set('t-7', 'Cuma', 6, '');
  set('t-7', 'Cuma', 7, '8/A (FEN BİLGİSİ)');
  set('t-7', 'Cuma', 8, '8/B (FEN BİLGİSİ)');

  // 8. GİZEM ÖRGÜT (t-8)
  set('t-8', 'Pazartesi', 1, '');
  set('t-8', 'Pazartesi', 2, '');
  set('t-8', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-8', 'Pazartesi', 4, '8/A (İNKILAP TARİHİ)');
  set('t-8', 'Pazartesi', 5, '8/A (İNKILAP TARİHİ)');
  set('t-8', 'Pazartesi', 6, '7/A (SOSYAL)');
  set('t-8', 'Pazartesi', 7, '7/A (SOSYAL)');
  set('t-8', 'Pazartesi', 8, '6/A (SOSYAL)');

  set('t-8', 'Salı', 1, '');
  set('t-8', 'Salı', 2, '');
  set('t-8', 'Salı', 3, '8/B (İNKILAP TARİHİ)');
  set('t-8', 'Salı', 4, '8/B (İNKILAP TARİHİ)');
  set('t-8', 'Salı', 5, '');
  set('t-8', 'Salı', 6, '');
  set('t-8', 'Salı', 7, '5/A (SOSYAL)');
  set('t-8', 'Salı', 8, '5/A (SOSYAL)');

  set('t-8', 'Çarşamba', 1, '7/B (SOSYAL)');
  set('t-8', 'Çarşamba', 2, '7/B (SOSYAL)');
  set('t-8', 'Çarşamba', 3, '');
  set('t-8', 'Çarşamba', 4, '6/B (SOSYAL)');
  set('t-8', 'Çarşamba', 5, '6/B (SOSYAL)');
  set('t-8', 'Çarşamba', 6, '');
  set('t-8', 'Çarşamba', 7, '8/B (İNKILAP TARİHİ)');
  set('t-8', 'Çarşamba', 8, '8/B (İNKILAP TARİHİ)');

  set('t-8', 'Perşembe', 1, '');
  set('t-8', 'Perşembe', 2, '');
  set('t-8', 'Perşembe', 3, '');
  set('t-8', 'Perşembe', 4, '8/A (İNKILAP TARİHİ)');
  set('t-8', 'Perşembe', 5, '8/A (İNKILAP TARİHİ)');
  set('t-8', 'Perşembe', 6, '6/B (SOSYAL)');
  set('t-8', 'Perşembe', 7, '');
  set('t-8', 'Perşembe', 8, '7/B (SOSYAL)');

  set('t-8', 'Cuma', 1, '6/A (SOSYAL)');
  set('t-8', 'Cuma', 2, '6/A (SOSYAL)');
  set('t-8', 'Cuma', 3, '5/B (SOSYAL)');
  set('t-8', 'Cuma', 4, '5/B (SOSYAL)');
  set('t-8', 'Cuma', 5, '6/B (SOSYAL)');
  set('t-8', 'Cuma', 6, '7/A (SOSYAL)');
  set('t-8', 'Cuma', 7, '');
  set('t-8', 'Cuma', 8, '');

  // 9. AYSEL GÖKÇE (t-9)
  set('t-9', 'Pazartesi', 1, '6/A (DİN KÜLTÜRÜ)');
  set('t-9', 'Pazartesi', 2, '6/A (DİN KÜLTÜRÜ)');
  set('t-9', 'Pazartesi', 3, '8/A (DİN KÜLTÜRÜ)');
  set('t-9', 'Pazartesi', 4, '');
  set('t-9', 'Pazartesi', 5, '');
  set('t-9', 'Pazartesi', 6, '');
  set('t-9', 'Pazartesi', 7, '8/B (DİN KÜLTÜRÜ)');
  set('t-9', 'Pazartesi', 8, '8/B (DİN KÜLTÜRÜ)');

  set('t-9', 'Salı', 1, '5/B (DİN KÜLTÜRÜ)');
  set('t-9', 'Salı', 2, '5/B (DİN KÜLTÜRÜ)');
  set('t-9', 'Salı', 3, '');
  set('t-9', 'Salı', 4, '');
  set('t-9', 'Salı', 5, '5/A (DİN KÜLTÜRÜ)');
  set('t-9', 'Salı', 6, '');
  set('t-9', 'Salı', 7, '6/B (DİN KÜLTÜRÜ)');
  set('t-9', 'Salı', 8, '6/B (DİN KÜLTÜRÜ)');

  set('t-9', 'Çarşamba', 1, '');
  set('t-9', 'Çarşamba', 2, '');
  set('t-9', 'Çarşamba', 3, '');
  set('t-9', 'Çarşamba', 4, '');
  set('t-9', 'Çarşamba', 5, '');
  set('t-9', 'Çarşamba', 6, '');
  set('t-9', 'Çarşamba', 7, '');
  set('t-9', 'Çarşamba', 8, '');

  set('t-9', 'Perşembe', 1, '');
  set('t-9', 'Perşembe', 2, '');
  set('t-9', 'Perşembe', 3, '');
  set('t-9', 'Perşembe', 4, '');
  set('t-9', 'Perşembe', 5, '7/B (DİN KÜLTÜRÜ)');
  set('t-9', 'Perşembe', 6, '7/B (DİN KÜLTÜRÜ)');
  set('t-9', 'Perşembe', 7, '');
  set('t-9', 'Perşembe', 8, '8/A (DİN KÜLTÜRÜ)');

  set('t-9', 'Cuma', 1, '');
  set('t-9', 'Cuma', 2, '8/A/8/B (LGS SINAV)');
  set('t-9', 'Cuma', 3, '8/A/8/B (LGS SINAV)');
  set('t-9', 'Cuma', 4, '8/A/8/B (LGS SINAV)');
  set('t-9', 'Cuma', 5, '8/A/8/B (LGS SINAV)');
  set('t-9', 'Cuma', 6, '');
  set('t-9', 'Cuma', 7, '7/A (DİN KÜLTÜRÜ)');
  set('t-9', 'Cuma', 8, '7/A (DİN KÜLTÜRÜ)');

  // 10. NUR ÖYKÜ ÜRGÜP (t-10)
  set('t-10', 'Pazartesi', 1, '');
  set('t-10', 'Pazartesi', 2, '');
  set('t-10', 'Pazartesi', 3, '');
  set('t-10', 'Pazartesi', 4, '6/B (MAİN COURSE)');
  set('t-10', 'Pazartesi', 5, '6/A (MAİN COURSE)');
  set('t-10', 'Pazartesi', 6, '6/A (MAİN COURSE)');
  set('t-10', 'Pazartesi', 7, '7/B (MAİN COURSE)');
  set('t-10', 'Pazartesi', 8, '7/B (MAİN COURSE)');

  set('t-10', 'Salı', 1, '');
  set('t-10', 'Salı', 2, '7/B (MAİN COURSE)');
  set('t-10', 'Salı', 3, '7/B (MAİN COURSE)');
  set('t-10', 'Salı', 4, '');
  set('t-10', 'Salı', 5, '7/A (SKİLLS)');
  set('t-10', 'Salı', 6, '7/A (SKİLLS)');
  set('t-10', 'Salı', 7, '8/A (MAİN COURSE)');
  set('t-10', 'Salı', 8, '8/A (MAİN COURSE)');

  set('t-10', 'Çarşamba', 1, '');
  set('t-10', 'Çarşamba', 2, '6/B (MAİN COURSE)');
  set('t-10', 'Çarşamba', 3, '6/B (MAİN COURSE)');
  set('t-10', 'Çarşamba', 4, '');
  set('t-10', 'Çarşamba', 5, '8/B (MAİN COURSE)');
  set('t-10', 'Çarşamba', 6, '8/B (MAİN COURSE)');
  set('t-10', 'Çarşamba', 7, '6/A (MAİN COURSE)');
  set('t-10', 'Çarşamba', 8, '');

  set('t-10', 'Perşembe', 1, '');
  set('t-10', 'Perşembe', 2, '');
  set('t-10', 'Perşembe', 3, '7/A (SKİLLS)');
  set('t-10', 'Perşembe', 4, '6/B (MAİN COURSE)');
  set('t-10', 'Perşembe', 5, '6/B (MAİN COURSE)');
  set('t-10', 'Perşembe', 6, '');
  set('t-10', 'Perşembe', 7, '7/B (MAİN COURSE)');
  set('t-10', 'Perşembe', 8, '6/A (MAİN COURSE)');

  set('t-10', 'Cuma', 1, '6/B (MAİN COURSE)');
  set('t-10', 'Cuma', 2, '6/B (MAİN COURSE)');
  set('t-10', 'Cuma', 3, '');
  set('t-10', 'Cuma', 4, '');
  set('t-10', 'Cuma', 5, '7/B (MAİN COURSE)');
  set('t-10', 'Cuma', 6, '7/B (MAİN COURSE)');
  set('t-10', 'Cuma', 7, '6/A (MAİN COURSE)');
  set('t-10', 'Cuma', 8, '6/A (MAİN COURSE)');

  // 11. ZEYNEP ÖZBAĞ (t-11)
  set('t-11', 'Pazartesi', 1, '');
  set('t-11', 'Pazartesi', 2, '5/B (MAİN COURSE)');
  set('t-11', 'Pazartesi', 3, '');
  set('t-11', 'Pazartesi', 4, '5/B (MAİN COURSE)');
  set('t-11', 'Pazartesi', 5, '5/A (SKİLLS)');
  set('t-11', 'Pazartesi', 6, '5/A (SKİLLS)');
  set('t-11', 'Pazartesi', 7, '');
  set('t-11', 'Pazartesi', 8, '5/B (MAİN COURSE)');

  set('t-11', 'Salı', 1, '');
  set('t-11', 'Salı', 2, '');
  set('t-11', 'Salı', 3, '5/B (MAİN COURSE)');
  set('t-11', 'Salı', 4, '5/B (MAİN COURSE)');
  set('t-11', 'Salı', 5, '');
  set('t-11', 'Salı', 6, '');
  set('t-11', 'Salı', 7, '7/A (MAİN COURSE)');
  set('t-11', 'Salı', 8, '7/A (MAİN COURSE)');

  set('t-11', 'Çarşamba', 1, '7/A (MAİN COURSE)');
  set('t-11', 'Çarşamba', 2, '7/A (MAİN COURSE)');
  set('t-11', 'Çarşamba', 3, '6/A (SKİLLS)');
  set('t-11', 'Çarşamba', 4, '');
  set('t-11', 'Çarşamba', 5, '5/B (MAİN COURSE)');
  set('t-11', 'Çarşamba', 6, '5/B (MAİN COURSE)');
  set('t-11', 'Çarşamba', 7, '');
  set('t-11', 'Çarşamba', 8, '7/A (MAİN COURSE)');

  set('t-11', 'Perşembe', 1, '');
  set('t-11', 'Perşembe', 2, '5/A (SKİLLS)');
  set('t-11', 'Perşembe', 3, '5/B (MAİN COURSE)');
  set('t-11', 'Perşembe', 4, '5/B (MAİN COURSE)');
  set('t-11', 'Perşembe', 5, '6/A (SKİLLS)');
  set('t-11', 'Perşembe', 6, '6/A (SKİLLS)');
  set('t-11', 'Perşembe', 7, '6/B (SKİLLS)');
  set('t-11', 'Perşembe', 8, '6/B (SKİLLS)');

  set('t-11', 'Cuma', 1, '');
  set('t-11', 'Cuma', 2, '');
  set('t-11', 'Cuma', 3, '');
  set('t-11', 'Cuma', 4, '7/A (MAİN COURSE)');
  set('t-11', 'Cuma', 5, '7/A (MAİN COURSE)');
  set('t-11', 'Cuma', 6, '6/B (SKİLLS)');
  set('t-11', 'Cuma', 7, '5/B (MAİN COURSE)');
  set('t-11', 'Cuma', 8, '5/B (MAİN COURSE)');

  // 12. ARMAN YILDIZ (t-12)
  set('t-12', 'Pazartesi', 1, '5/B (SKİLLS)');
  set('t-12', 'Pazartesi', 2, '');
  set('t-12', 'Pazartesi', 3, '');
  set('t-12', 'Pazartesi', 4, '');
  set('t-12', 'Pazartesi', 5, '8/B (LGS İNGİLİZCE)');
  set('t-12', 'Pazartesi', 6, '8/B (LGS İNGİLİZCE)');
  set('t-12', 'Pazartesi', 7, '5/A (MAİN COURSE)');
  set('t-12', 'Pazartesi', 8, '5/A (MAİN COURSE)');

  set('t-12', 'Salı', 1, '8/A (LGS İNGİLİZCE)');
  set('t-12', 'Salı', 2, '8/A (LGS İNGİLİZCE)');
  set('t-12', 'Salı', 3, '5/A (MAİN COURSE)');
  set('t-12', 'Salı', 4, '5/A (MAİN COURSE)');
  set('t-12', 'Salı', 5, '8/B (LGS İNGİLİZCE)');
  set('t-12', 'Salı', 6, '8/B (LGS İNGİLİZCE)');
  set('t-12', 'Salı', 7, '');
  set('t-12', 'Salı', 8, '');

  set('t-12', 'Çarşamba', 1, '');
  set('t-12', 'Çarşamba', 2, '');
  set('t-12', 'Çarşamba', 3, '5/A (MAİN COURSE)');
  set('t-12', 'Çarşamba', 4, '5/A (MAİN COURSE)');
  set('t-12', 'Çarşamba', 5, '');
  set('t-12', 'Çarşamba', 6, '');
  set('t-12', 'Çarşamba', 7, '');
  set('t-12', 'Çarşamba', 8, '7/B (SKİLLS)');

  set('t-12', 'Perşembe', 1, '8/A (LGS İNGİLİZCE)');
  set('t-12', 'Perşembe', 2, '8/A (LGS İNGİLİZCE)');
  set('t-12', 'Perşembe', 3, '5/A (MAİN COURSE)');
  set('t-12', 'Perşembe', 4, '');
  set('t-12', 'Perşembe', 5, '5/A (MAİN COURSE)');
  set('t-12', 'Perşembe', 6, '5/A (MAİN COURSE)');
  set('t-12', 'Perşembe', 7, '5/B (SKİLLS)');
  set('t-12', 'Perşembe', 8, '5/B (SKİLLS)');

  set('t-12', 'Cuma', 1, '8/A (LGS İNGİLİZCE)');
  set('t-12', 'Cuma', 2, '8/A (LGS İNGİLİZCE)');
  set('t-12', 'Cuma', 3, '7/B (SKİLLS)');
  set('t-12', 'Cuma', 4, '7/B (SKİLLS)');
  set('t-12', 'Cuma', 5, '');
  set('t-12', 'Cuma', 6, '8/B (LGS İNGİLİZCE)');
  set('t-12', 'Cuma', 7, '5/A (MAİN COURSE)');
  set('t-12', 'Cuma', 8, '5/A (MAİN COURSE)');

  // 13. EMEL GÜNORAL (t-13)
  set('t-13', 'Pazartesi', 1, '7/B (ALMANCA)');
  set('t-13', 'Pazartesi', 2, '7/B (ALMANCA)');
  set('t-13', 'Pazartesi', 3, '5/A/5/B/6/A/6/B/7/A/7/B (SINAV SAATİ)');
  set('t-13', 'Pazartesi', 4, '');
  set('t-13', 'Pazartesi', 5, '6/B (ALMANCA)');
  set('t-13', 'Pazartesi', 6, '6/B (ALMANCA)');
  set('t-13', 'Pazartesi', 7, '');
  set('t-13', 'Pazartesi', 8, '');

  set('t-13', 'Salı', 1, '6/A (ALMANCA)');
  set('t-13', 'Salı', 2, '6/A (ALMANCA)');
  set('t-13', 'Salı', 3, '');
  set('t-13', 'Salı', 4, '');
  set('t-13', 'Salı', 5, '5/B (ALMANCA)');
  set('t-13', 'Salı', 6, '5/B (ALMANCA)');
  set('t-13', 'Salı', 7, '');
  set('t-13', 'Salı', 8, '');

  set('t-13', 'Çarşamba', 1, '');
  set('t-13', 'Çarşamba', 2, '');
  set('t-13', 'Çarşamba', 3, '7/A (ALMANCA)');
  set('t-13', 'Çarşamba', 4, '7/A (ALMANCA)');
  set('t-13', 'Çarşamba', 5, '5/A (ALMANCA)');
  set('t-13', 'Çarşamba', 6, '5/A (ALMANCA)');
  set('t-13', 'Çarşamba', 7, '');
  set('t-13', 'Çarşamba', 8, '');

  DAYS_OF_WEEK.slice(3).forEach((d) => {
    for (let h = 1; h <= 8; h++) set('t-13', d, h, '');
  });

  // 14. ÇAĞATAY HANCI (t-14)
  set('t-14', 'Pazartesi', 1, '');
  set('t-14', 'Pazartesi', 2, '');
  set('t-14', 'Pazartesi', 3, '');
  set('t-14', 'Pazartesi', 4, '5/A (KODLAMA VE ROBOTİK)');
  set('t-14', 'Pazartesi', 5, '');
  set('t-14', 'Pazartesi', 6, '');
  set('t-14', 'Pazartesi', 7, '6/B (KODLAMA VE ROBOTİK)');
  set('t-14', 'Pazartesi', 8, '6/B (KODLAMA VE ROBOTİK)');

  set('t-14', 'Salı', 1, '');
  set('t-14', 'Salı', 2, '5/B (KODLAMA VE ROBOTİK)');
  set('t-14', 'Salı', 3, '7/A (KODLAMA VE ROBOTİK)');
  set('t-14', 'Salı', 4, '');
  set('t-14', 'Salı', 5, '6/A (KODLAMA VE ROBOTİK)');
  set('t-14', 'Salı', 6, '6/A (KODLAMA VE ROBOTİK)');
  set('t-14', 'Salı', 7, '');
  set('t-14', 'Salı', 8, '7/B (KODLAMA VE ROBOTİK)');

  DAYS_OF_WEEK.slice(2).forEach((d) => {
    for (let h = 1; h <= 8; h++) set('t-14', d, h, '');
  });

  // 15. BANU YILMAZ (t-15)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Çarşamba') {
        if (h === 1) cls = '6/B (MÜZİK)';
        else if (h === 2) cls = '6/A (MÜZİK)';
        else if (h === 3) cls = '7/B (MÜZİK)';
        else if (h === 5) cls = '7/A (MÜZİK)';
      }
      set('t-15', d, h, cls);
    }
  });

  // 16. NURDANUR OKKAY (t-16)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Çarşamba') {
        if (h === 5 || h === 6) cls = '6/A/6/B (BEDEN EĞİTİMİ)';
        else if (h === 7 || h === 8) cls = '5/A/5/B (BEDEN EĞİTİMİ)';
      }
      set('t-16', d, h, cls);
    }
  });

  // 17. BARIŞ KURUÇAY (t-17)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Çarşamba') {
        if (h === 1) cls = '6/B (MÜZİK)';
        else if (h === 2) cls = '6/A (MÜZİK)';
        else if (h === 3) cls = '7/B (MÜZİK)';
        else if (h === 5) cls = '7/A (MÜZİK)';
      }
      set('t-17', d, h, cls);
    }
  });

  // 18. EBUBEKİR TAŞ (t-18)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Çarşamba') {
        if (h === 3 || h === 4) cls = '8/A (BEDEN EĞİTİMİ)';
        else if (h === 5 || h === 6) cls = '6/A/6/B (BEDEN EĞİTİMİ)';
        else if (h === 7 || h === 8) cls = '5/A/5/B (BEDEN EĞİTİMİ)';
      } else if (d === 'Perşembe') {
        if (h === 1 || h === 2) cls = '7/B (BEDEN EĞİTİMİ)';
        else if (h === 5 || h === 6) cls = '8/B (BEDEN EĞİTİMİ)';
        else if (h === 7 || h === 8) cls = '7/A (BEDEN EĞİTİMİ)';
      }
      set('t-18', d, h, cls);
    }
  });

  // 19. AYSU NAZ YILDIZ (t-19)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Pazartesi' && h === 6) cls = '7/B (GÖRSEL SANATLAR)';
      else if (d === 'Salı') {
        if (h === 4) cls = '7/A (GÖRSEL SANATLAR)';
        else if (h === 5) cls = '6/B (GÖRSEL SANATLAR)';
        else if (h === 6) cls = '6/A (GÖRSEL SANATLAR)';
      }
      set('t-19', d, h, cls);
    }
  });

  // 20. JERMAIN WILMER LUMBUKU (t-20)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Perşembe') {
        if (h === 1 || h === 2) cls = '6/B (NATİVE)';
        else if (h === 3 || h === 4) cls = '7/B (NATİVE)';
        else if (h === 5 || h === 6) cls = '5/B (NATİVE)';
      } else if (d === 'Cuma') {
        if (h === 1 || h === 2) cls = '7/A (NATİVE)';
        else if (h === 3 || h === 4) cls = '5/A (NATİVE)';
        else if (h === 5 || h === 6) cls = '6/A (NATİVE)';
      }
      set('t-20', d, h, cls);
    }
  });

  // 21. SELÇUK AKSOY (t-21)
  DAYS_OF_WEEK.forEach((d) => {
    for (let h = 1; h <= 8; h++) {
      let cls = '';
      if (d === 'Çarşamba') {
        if (h === 1) cls = '6/B (MÜZİK)';
        else if (h === 2) cls = '6/A (MÜZİK)';
        else if (h === 3) cls = '7/B (MÜZİK)';
        else if (h === 5) cls = '7/A (MÜZİK)';
      }
      set('t-21', d, h, cls);
    }
  });

  return slots;
}
