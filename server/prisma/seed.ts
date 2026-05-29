import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Languages
  const kannada = await prisma.language.upsert({
    where: { code: 'kn' },
    update: {},
    create: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  });
  const english = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: { code: 'en', name: 'English', nativeName: 'English' },
  });
  const hindi = await prisma.language.upsert({
    where: { code: 'hi' },
    update: {},
    create: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  });

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@smartnav.com' },
    update: {},
    create: {
      email: 'admin@smartnav.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // Tourist user
  const touristPassword = await bcrypt.hash('tourist123', 10);
  await prisma.user.upsert({
    where: { email: 'tourist@smartnav.com' },
    update: {},
    create: {
      email: 'tourist@smartnav.com',
      password: touristPassword,
      name: 'Demo Tourist',
      role: Role.TOURIST,
    },
  });

  // Tourist Place
  const place = await prisma.touristPlace.upsert({
    where: { id: 'place-belur-001' },
    update: {},
    create: {
      id: 'place-belur-001',
      name: 'Belur Chennakeshava Temple',
      location: 'Belur, Hassan District, Karnataka',
      description:
        'A 12th-century Hoysala temple dedicated to Vishnu, famous for its intricate sculptures and architecture.',
    },
  });

  // Sculptures
  const sculpture1 = await prisma.sculpture.upsert({
    where: { id: 'sculp-001' },
    update: {},
    create: {
      id: 'sculp-001',
      placeId: place.id,
      name: 'Darpana Sundari',
      historicalInfo:
        'Carved in the 12th century during the reign of Hoysala King Vishnuvardhana. This sculpture represents the mirror-holding maiden and is considered one of the finest examples of Hoysala artistry.',
      significance:
        'Symbolizes beauty, grace, and the artistic mastery of Hoysala craftsmen. She is depicted holding a mirror in her left hand, symbolizing self-reflection.',
      architecture:
        'Carved from chloritic schite (soapstone), the sculpture stands 5 feet tall with intricate jewelry details. The figure displays the tribhanga posture — a triple bend at neck, waist, and knee.',
      images: [],
      orderIndex: 1,
      nextSculptureId: 'sculp-002',
    },
  });

  const sculpture2 = await prisma.sculpture.upsert({
    where: { id: 'sculp-002' },
    update: {},
    create: {
      id: 'sculp-002',
      placeId: place.id,
      name: 'Mohini',
      historicalInfo:
        'Mohini is an avatar of Vishnu, depicted as an enchantress. This 12th-century carving is located on the outer wall of the Navaranga hall.',
      significance:
        'Represents divine feminine beauty and the cosmic illusion (Maya). The sculpture is worshipped as an embodiment of Vishnu\'s power to enchant.',
      architecture:
        'The figure is depicted in a graceful dance posture. Ornate headdress, armlets, and waistband are carved with precision. The expression conveys both serenity and mystique.',
      images: [],
      orderIndex: 2,
      nextSculptureId: null,
    },
  });

  // Audio Guides (placeholder text — actual audio files uploaded via admin)
  await prisma.audioGuide.upsert({
    where: { sculptureId_languageId: { sculptureId: sculpture1.id, languageId: english.id } },
    update: {},
    create: {
      sculptureId: sculpture1.id,
      languageId: english.id,
      audioUrl: '',
      textContent:
        'Welcome to Darpana Sundari, the mirror-holding maiden. Carved in the 12th century during the reign of Hoysala King Vishnuvardhana, this magnificent sculpture represents the pinnacle of Hoysala artistry. She stands in the tribhanga posture — a triple bend at neck, waist, and knee — holding a mirror that symbolizes self-reflection and inner beauty.',
    },
  });

  await prisma.audioGuide.upsert({
    where: { sculptureId_languageId: { sculptureId: sculpture1.id, languageId: kannada.id } },
    update: {},
    create: {
      sculptureId: sculpture1.id,
      languageId: kannada.id,
      audioUrl: '',
      textContent:
        'ದರ್ಪಣ ಸುಂದರಿಗೆ ಸ್ವಾಗತ. ಇದು ೧೨ನೇ ಶತಮಾನದಲ್ಲಿ ಹೊಯ್ಸಳ ರಾಜ ವಿಷ್ಣುವರ್ಧನನ ಆಳ್ವಿಕೆಯಲ್ಲಿ ಕೆತ್ತಲಾದ ಶಿಲ್ಪ. ಕನ್ನಡ ನಾಡಿನ ಶಿಲ್ಪಕಲೆಯ ಸಾರ್ವಕಾಲಿಕ ಮೇರುಕೃತಿ.',
    },
  });

  await prisma.audioGuide.upsert({
    where: { sculptureId_languageId: { sculptureId: sculpture1.id, languageId: hindi.id } },
    update: {},
    create: {
      sculptureId: sculpture1.id,
      languageId: hindi.id,
      audioUrl: '',
      textContent:
        'दर्पण सुंदरी में आपका स्वागत है। यह मूर्ति 12वीं शताब्दी में होयसाल राजा विष्णुवर्धन के शासनकाल में उकेरी गई थी। यह होयसाल शिल्पकला का एक अनूठा उदाहरण है।',
    },
  });

  console.log('✅ Seed completed successfully');
  console.log('Admin: admin@smartnav.com / admin123');
  console.log('Tourist: tourist@smartnav.com / tourist123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });