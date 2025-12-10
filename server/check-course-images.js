require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

async function checkCourseImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({}, 'title image pricing').lean();
    
    console.log('\n=== ALL COURSES ===\n');
    courses.forEach((course, index) => {
      const hasImage = course.image && course.image.trim() !== '';
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Price: $${course.pricing}`);
      console.log(`   Image: ${hasImage ? '✓ Present' : '✗ MISSING'}`);
      if (hasImage) {
        console.log(`   URL: ${course.image.substring(0, 80)}${course.image.length > 80 ? '...' : ''}`);
      }
      console.log('---');
    });

    const missingImages = courses.filter(c => !c.image || c.image.trim() === '');
    console.log(`\nTotal courses: ${courses.length}`);
    console.log(`Courses with images: ${courses.length - missingImages.length}`);
    console.log(`Courses missing images: ${missingImages.length}`);

    if (missingImages.length > 0) {
      console.log('\n⚠️ Courses with missing images:');
      missingImages.forEach(c => console.log(`  - ${c.title}`));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCourseImages();
