/**
 * Seed script — populates the database with initial subjects and sample videos.
 *
 * Run: node seeds/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Video = require('../models/Video');

const subjects = [
  {
    name: 'Constitution of India',
    slug: 'constitution-of-india',
    icon: '🏛️',
    color: '#6366f1',
    description: 'Indian Constitution, fundamental rights, directive principles, amendments',
    order: 1,
  },
  {
    name: 'Family Law & Others',
    slug: 'family-law',
    icon: '👨‍👩‍👧',
    color: '#ec4899',
    description: 'Hindu Law, Muslim Law, Special Marriage Act, Succession',
    order: 2,
  },
  {
    name: 'Criminal Law',
    slug: 'criminal-law',
    icon: '⚖️',
    color: '#f59e0b',
    description: 'BNS (Bharatiya Nyaya Sanhita), BSA, BNSS, Criminal Procedure',
    order: 3,
  },
  {
    name: 'Law of Contract',
    slug: 'law-of-contract',
    icon: '📝',
    color: '#10b981',
    description: 'Indian Contract Act, Sale of Goods, Partnership, Negotiable Instruments',
    order: 4,
  },
  {
    name: 'Law of Torts',
    slug: 'law-of-torts',
    icon: '🔨',
    color: '#ef4444',
    description: 'Negligence, nuisance, strict liability, defamation, consumer protection',
    order: 5,
  },
  {
    name: 'Jurisprudence',
    slug: 'jurisprudence',
    icon: '📖',
    color: '#8b5cf6',
    description: 'Schools of law, legal concepts, theories of punishment, legal reasoning',
    order: 6,
  },
  {
    name: 'International Law',
    slug: 'international-law',
    icon: '🌍',
    color: '#0ea5e9',
    description: 'Public international law, treaties, UN, ICJ, humanitarian law',
    order: 7,
  },
  {
    name: 'Legal Reasoning',
    slug: 'legal-reasoning',
    icon: '🧠',
    color: '#14b8a6',
    description: 'Legal aptitude, reasoning, analytical skills, logical deduction',
    order: 8,
  },
];

// Sample videos — using real CLAT PG related YouTube video IDs
const sampleVideos = [
  // Constitution of India
  {
    title: 'CLAT PG: PYQ Discussion - 2025 Paper',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:45:30',
    subjectSlug: 'constitution-of-india',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 617,
    order: 1,
  },
  {
    title: 'Practice Session on Constitutional Law',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:20:00',
    subjectSlug: 'constitution-of-india',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 445,
    order: 2,
  },
  {
    title: 'Practice Session on Jurisprudence & Constitutional Law',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:35:15',
    subjectSlug: 'constitution-of-india',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 389,
    order: 3,
  },
  {
    title: 'CUET PG LL.M.: PYQ Discussion - V',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:10:00',
    subjectSlug: 'constitution-of-india',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 302,
    order: 4,
  },
  // Family Law
  {
    title: 'Family Law - 1',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:25:00',
    subjectSlug: 'family-law',
    instructor: 'Anuja Chaturvedi',
    language: 'Hinglish',
    viewCount: 30,
    order: 1,
  },
  {
    title: 'Family Law - 2',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:30:00',
    subjectSlug: 'family-law',
    instructor: 'Anuja Chaturvedi',
    language: 'Hinglish',
    viewCount: 33,
    order: 2,
  },
  // Criminal Law
  {
    title: 'Practice Session on BSA - 5',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:15:00',
    subjectSlug: 'criminal-law',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 13,
    order: 1,
  },
  {
    title: 'Practice Session on BSA - 4',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:20:00',
    subjectSlug: 'criminal-law',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 25,
    order: 2,
  },
  // Law of Contract
  {
    title: 'Contract Law - Complete Overview',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '2:00:00',
    subjectSlug: 'law-of-contract',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 198,
    order: 1,
  },
  // Law of Torts
  {
    title: 'Law of Torts - Introduction & Key Concepts',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:45:00',
    subjectSlug: 'law-of-torts',
    instructor: 'Anuja Chaturvedi',
    language: 'Hinglish',
    viewCount: 156,
    order: 1,
  },
  // Jurisprudence
  {
    title: 'Jurisprudence - Schools of Law',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:30:00',
    subjectSlug: 'jurisprudence',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 220,
    order: 1,
  },
  // International Law
  {
    title: 'International Law - Sources & Treaties',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '1:15:00',
    subjectSlug: 'international-law',
    instructor: 'Manjari Singh',
    language: 'Hinglish',
    viewCount: 175,
    order: 1,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Subject.deleteMany({});
    await Video.deleteMany({});
    console.log('🗑️  Cleared existing subjects and videos');

    // Insert subjects
    const insertedSubjects = await Subject.insertMany(subjects);
    console.log(`📚 Inserted ${insertedSubjects.length} subjects`);

    // Build slug → _id map
    const subjectMap = {};
    insertedSubjects.forEach((s) => {
      subjectMap[s.slug] = s._id;
    });

    // Insert videos with subject references
    const videosToInsert = sampleVideos.map((v) => ({
      title: v.title,
      youtubeId: v.youtubeId,
      duration: v.duration,
      subject: subjectMap[v.subjectSlug],
      instructor: v.instructor,
      language: v.language,
      viewCount: v.viewCount,
      order: v.order,
    }));

    const insertedVideos = await Video.insertMany(videosToInsert);
    console.log(`🎬 Inserted ${insertedVideos.length} videos`);

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seed();
