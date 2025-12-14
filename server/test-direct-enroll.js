require('dotenv').config();
const axios = require('axios');

async function testDirectEnroll() {
  try {
    console.log('Testing /student/order/direct-enroll endpoint...\n');

    const enrollData = {
      userId: '6938528a400ee19306ed564b', // Replace with actual user ID
      userName: 'testuser',
      userEmail: 'test@gmail.com',
      instructorId: '123',
      instructorName: 'Test Instructor',
      courseImage: 'https://example.com/image.jpg',
      courseTitle: 'Test Course',
      courseId: '123',
      coursePricing: 49.99,
    };

    const response = await axios.post('http://localhost:5000/student/order/direct-enroll', enrollData);

    console.log('✅ API Response:', response.data);
    console.log('\n✓ Endpoint is working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectEnroll();
