require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

// More reliable direct Unsplash image URLs that work consistently
const reliableImages = [
  'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop&q=80', // React
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop&q=80', // Node.js
  'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a5d5?w=500&h=300&fit=crop&q=80', // Python
  'https://images.unsplash.com/photo-1516321318423-f06f70504764?w=500&h=300&fit=crop&q=80', // Machine Learning
  'https://images.unsplash.com/photo-1605236453806-6ff36851219e?w=500&h=300&fit=crop&q=80', // Flutter
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500&h=300&fit=crop&q=80', // AWS
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop&q=80', // Design
  'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop&q=80', // Web Dev
];

const courseUpdates = [
  { title: 'Introduction to Web Development', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop&q=80' },
  { title: 'Advanced React.js Mastery', image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop&q=80' },
  { title: 'Full Stack Development with Node.js', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop&q=80' },
  { title: 'Python for Data Science', image: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a5d5?w=500&h=300&fit=crop&q=80' },
  { title: 'Machine Learning Basics', image: 'https://images.unsplash.com/photo-1516321318423-f06f70504764?w=500&h=300&fit=crop&q=80' },
  { title: 'Mobile App Development with Flutter', image: 'https://images.unsplash.com/photo-1605236453806-6ff36851219e?w=500&h=300&fit=crop&q=80' },
  { title: 'Cloud Computing with AWS', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500&h=300&fit=crop&q=80' },
  { title: 'UI/UX Design Principles', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop&q=80' },
];

async function fixCourseImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    for (const update of courseUpdates) {
      const course = await Course.findOneAndUpdate(
        { title: update.title },
        { image: update.image },
        { new: true }
      );
      
      if (course) {
        console.log(`✓ Updated: ${course.title}`);
      } else {
        console.log(`✗ Not found: ${update.title}`);
      }
    }

    console.log('\n✓ All courses updated with reliable image URLs');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCourseImages();
