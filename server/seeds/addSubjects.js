/**
 * Add new CLAT PG subjects (skips if already exists by name).
 * Run: node seeds/addSubjects.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Subject = require('../models/Subject');

const newSubjects = [
  {
    name: 'Constitutional Law',
    slug: 'constitutional-law',
    icon: '🏛️',
    color: '#6366f1',
    description: 'Constitutional provisions, fundamental rights, duties, amendments & landmark cases',
    order: 1,
  },
  {
    name: 'Jurisprudence',
    slug: 'jurisprudence',
    icon: '📖',
    color: '#8b5cf6',
    description: 'Schools of law, legal concepts, theories of punishment, legal reasoning',
    order: 2,
  },
  {
    name: 'Administrative Law',
    slug: 'administrative-law',
    icon: '🏢',
    color: '#0891b2',
    description: 'Delegated legislation, judicial review, administrative tribunals, natural justice',
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
    name: 'Criminal Law',
    slug: 'criminal-law',
    icon: '⚖️',
    color: '#f59e0b',
    description: 'IPC/BNS, CrPC/BNSS, BSA, criminal procedure & evidence',
    order: 6,
  },
  {
    name: 'Family Law',
    slug: 'family-law',
    icon: '👨‍👩‍👧',
    color: '#ec4899',
    description: 'Hindu Law, Muslim Law, Special Marriage Act, Succession, Guardianship',
    order: 7,
  },
  {
    name: 'Property Law',
    slug: 'property-law',
    icon: '🏠',
    color: '#d97706',
    description: 'Transfer of Property Act, Easements, Registration, Land Acquisition',
    order: 8,
  },
  {
    name: 'Company Law',
    slug: 'company-law',
    icon: '🏦',
    color: '#2563eb',
    description: 'Companies Act, corporate governance, SEBI, mergers & acquisitions',
    order: 9,
  },
  {
    name: 'Public International Law',
    slug: 'public-international-law',
    icon: '🌍',
    color: '#0ea5e9',
    description: 'Treaties, UN, ICJ, humanitarian law, law of the sea, diplomatic immunity',
    order: 10,
  },
  {
    name: 'Environmental Law',
    slug: 'environmental-law',
    icon: '🌿',
    color: '#16a34a',
    description: 'EPA, Wildlife Protection Act, NGT, pollution control, sustainable development',
    order: 11,
  },
  {
    name: 'Labour and Industrial Law',
    slug: 'labour-and-industrial-law',
    icon: '👷',
    color: '#ea580c',
    description: 'Industrial Disputes Act, Factories Act, Trade Unions, Labour Codes',
    order: 12,
  },
  {
    name: 'Tax Law',
    slug: 'tax-law',
    icon: '💰',
    color: '#7c3aed',
    description: 'Income Tax, GST, taxation principles, assessment, appeals',
    order: 13,
  },
];

async function addSubjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, remove old subjects that have been renamed/replaced
    const oldNames = ['Constitution of India', 'Family Law & Others', 'International Law', 'Legal Reasoning'];
    const deleted = await Subject.deleteMany({ name: { $in: oldNames } });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleted.deletedCount} old subject(s)`);
    }

    let added = 0;
    let skipped = 0;

    for (const subj of newSubjects) {
      const exists = await Subject.findOne({ slug: subj.slug });
      if (exists) {
        // Update existing subject with new data
        await Subject.findByIdAndUpdate(exists._id, subj);
        console.log(`🔄 Updated: ${subj.icon} ${subj.name}`);
        skipped++;
      } else {
        await Subject.create(subj);
        console.log(`✅ Added:   ${subj.icon} ${subj.name}`);
        added++;
      }
    }

    console.log(`\n🎉 Done! Added: ${added}, Updated: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSubjects();
