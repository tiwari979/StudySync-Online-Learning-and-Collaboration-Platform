require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./models/Course");

const MONGO_URI = process.env.MONGO_URI;

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Sample courses data
    const sampleCourses = [
      {
        instructorId: "instructor1",
        instructorName: "Dr. John Smith",
        date: new Date("2024-01-15"),
        title: "Introduction to Web Development",
        category: "web-development",
        level: "beginner",
        primaryLanguage: "english",
        subtitle: "Learn HTML, CSS, and JavaScript from scratch",
        description:
          "This comprehensive course covers the fundamentals of web development. Learn how to build responsive websites using HTML5, CSS3, and modern JavaScript. Perfect for beginners who want to start their web development journey.",
        image:
          "https://source.unsplash.com/featured/400x300/?web,development,code",
        welcomeMessage:
          "Welcome to Web Development! This course will teach you everything you need to know to build professional websites.",
        pricing: 49.99,
        objectives:
          "Learn HTML5, CSS3, JavaScript basics, Responsive design, DOM manipulation, and how to deploy your website online.",
        students: [],
        curriculum: [
          {
            title: "HTML Basics",
            videoUrl: "https://example.com/html-basics",
            freePreview: true,
          },
          {
            title: "CSS Styling",
            videoUrl: "https://example.com/css-styling",
            freePreview: true,
          },
          {
            title: "JavaScript Fundamentals",
            videoUrl: "https://example.com/js-basics",
            freePreview: false,
          },
          {
            title: "Responsive Design",
            videoUrl: "https://example.com/responsive",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor2",
        instructorName: "Sarah Johnson",
        date: new Date("2024-01-20"),
        title: "Advanced React.js Mastery",
        category: "web-development",
        level: "advanced",
        primaryLanguage: "english",
        subtitle: "Master React hooks, context API, and state management",
        description:
          "Deep dive into React.js with advanced patterns and best practices. Learn React Hooks, Context API, Redux, and build scalable applications. This course is ideal for developers with JavaScript experience.",
        image:
          "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to Advanced React! Get ready to become a React expert and build professional applications.",
        pricing: 79.99,
        objectives:
          "Master React hooks, Context API, Redux, React Router, Performance optimization, and advanced component patterns.",
        students: [],
        curriculum: [
          {
            title: "React Fundamentals Review",
            videoUrl: "https://example.com/react-review",
            freePreview: true,
          },
          {
            title: "React Hooks Deep Dive",
            videoUrl: "https://example.com/hooks",
            freePreview: false,
          },
          {
            title: "State Management with Redux",
            videoUrl: "https://example.com/redux",
            freePreview: false,
          },
          {
            title: "Building Real Projects",
            videoUrl: "https://example.com/projects",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor3",
        instructorName: "Mike Davis",
        date: new Date("2024-02-01"),
        title: "Full Stack Development with Node.js",
        category: "backend",
        level: "intermediate",
        primaryLanguage: "english",
        subtitle: "Build complete applications with Node.js and Express",
        description:
          "Learn to build full-stack web applications using Node.js, Express, MongoDB, and more. This course covers both frontend and backend development with practical projects.",
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to Full Stack Development! Build complete web applications from start to finish.",
        pricing: 89.99,
        objectives:
          "Learn Node.js, Express, MongoDB, RESTful APIs, Authentication, Deployment, and real-world project development.",
        students: [],
        curriculum: [
          {
            title: "Node.js Basics",
            videoUrl: "https://example.com/node-basics",
            freePreview: true,
          },
          {
            title: "Express Framework",
            videoUrl: "https://example.com/express",
            freePreview: false,
          },
          {
            title: "Database Design with MongoDB",
            videoUrl: "https://example.com/mongodb",
            freePreview: false,
          },
          {
            title: "Building RESTful APIs",
            videoUrl: "https://example.com/api",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor4",
        instructorName: "Emma Wilson",
        date: new Date("2024-02-10"),
        title: "Python for Data Science",
        category: "data-science",
        level: "intermediate",
        primaryLanguage: "english",
        subtitle: "Master Python, Pandas, NumPy, and Matplotlib",
        description:
          "Learn data science with Python. This course covers NumPy, Pandas, Matplotlib, and scikit-learn. Build real data science projects and gain practical skills.",
        image:
          "https://images.unsplash.com/photo-1526374965328-7f5ae4e8a5d5?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to Data Science! Learn to analyze and visualize data with Python.",
        pricing: 59.99,
        objectives:
          "Master Python basics, NumPy, Pandas, Data visualization, Statistical analysis, and Machine Learning fundamentals.",
        students: [],
        curriculum: [
          {
            title: "Python Fundamentals",
            videoUrl: "https://example.com/python-basics",
            freePreview: true,
          },
          {
            title: "NumPy and Arrays",
            videoUrl: "https://example.com/numpy",
            freePreview: false,
          },
          {
            title: "Data Manipulation with Pandas",
            videoUrl: "https://example.com/pandas",
            freePreview: false,
          },
          {
            title: "Data Visualization",
            videoUrl: "https://example.com/visualization",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor5",
        instructorName: "Alex Chen",
        date: new Date("2024-02-15"),
        title: "Machine Learning Basics",
        category: "data-science",
        level: "advanced",
        primaryLanguage: "english",
        subtitle: "Introduction to ML algorithms and scikit-learn",
        description:
          "Get started with machine learning! Learn supervised and unsupervised learning, feature engineering, model evaluation, and deployment strategies.",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f70504504?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to Machine Learning! Start your AI journey today.",
        pricing: 99.99,
        objectives:
          "Understand ML algorithms, supervised/unsupervised learning, feature engineering, model evaluation, and real-world applications.",
        students: [],
        curriculum: [
          {
            title: "ML Fundamentals",
            videoUrl: "https://example.com/ml-basics",
            freePreview: true,
          },
          {
            title: "Supervised Learning",
            videoUrl: "https://example.com/supervised",
            freePreview: false,
          },
          {
            title: "Unsupervised Learning",
            videoUrl: "https://example.com/unsupervised",
            freePreview: false,
          },
          {
            title: "Model Deployment",
            videoUrl: "https://example.com/deployment",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor6",
        instructorName: "Lisa Anderson",
        date: new Date("2024-02-20"),
        title: "Mobile App Development with Flutter",
        category: "mobile",
        level: "intermediate",
        primaryLanguage: "english",
        subtitle: "Build cross-platform apps with Flutter and Dart",
        description:
          "Learn to build beautiful, fast mobile applications for iOS and Android using Flutter. This course covers Dart, widgets, state management, and deployment.",
        image:
          "https://images.unsplash.com/photo-1605236453806-6ff36851219e?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to Flutter Development! Build apps that work on any platform.",
        pricing: 69.99,
        objectives:
          "Learn Dart programming, Flutter widgets, State management, APIs integration, and App deployment.",
        students: [],
        curriculum: [
          {
            title: "Dart Basics",
            videoUrl: "https://example.com/dart",
            freePreview: true,
          },
          {
            title: "Flutter Widgets",
            videoUrl: "https://example.com/widgets",
            freePreview: false,
          },
          {
            title: "State Management",
            videoUrl: "https://example.com/state-mgmt",
            freePreview: false,
          },
          {
            title: "Publishing Your App",
            videoUrl: "https://example.com/publish",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor7",
        instructorName: "Robert Taylor",
        date: new Date("2024-03-01"),
        title: "Cloud Computing with AWS",
        category: "devops",
        level: "intermediate",
        primaryLanguage: "english",
        subtitle: "Deploy and manage applications on AWS",
        description:
          "Master Amazon Web Services (AWS). Learn about EC2, S3, RDS, Lambda, and other core AWS services. Deploy production-ready applications.",
        image:
          "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to AWS! Learn cloud computing and become a cloud architect.",
        pricing: 79.99,
        objectives:
          "Understand AWS services, EC2, S3, RDS, Lambda, Deployment, Security, and Cost optimization.",
        students: [],
        curriculum: [
          {
            title: "AWS Fundamentals",
            videoUrl: "https://example.com/aws-basics",
            freePreview: true,
          },
          {
            title: "EC2 and Compute",
            videoUrl: "https://example.com/ec2",
            freePreview: false,
          },
          {
            title: "Storage and Databases",
            videoUrl: "https://example.com/s3-rds",
            freePreview: false,
          },
          {
            title: "Deployment and Scaling",
            videoUrl: "https://example.com/deploy",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
      {
        instructorId: "instructor8",
        instructorName: "Priya Patel",
        date: new Date("2024-03-05"),
        title: "UI/UX Design Principles",
        category: "design",
        level: "beginner",
        primaryLanguage: "english",
        subtitle: "Learn design thinking and create beautiful user experiences",
        description:
          "Comprehensive guide to UI/UX design. Learn design principles, wireframing, prototyping, and user research. Create stunning digital experiences.",
        image:
          "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&q=80",
        welcomeMessage:
          "Welcome to UI/UX Design! Learn to design beautiful and user-friendly interfaces.",
        pricing: 54.99,
        objectives:
          "Understand design principles, wireframing, prototyping, user research, and design tools like Figma.",
        students: [],
        curriculum: [
          {
            title: "Design Fundamentals",
            videoUrl: "https://example.com/design-basics",
            freePreview: true,
          },
          {
            title: "Color Theory and Typography",
            videoUrl: "https://example.com/color-typo",
            freePreview: false,
          },
          {
            title: "Wireframing and Prototyping",
            videoUrl: "https://example.com/wireframe",
            freePreview: false,
          },
          {
            title: "User Research",
            videoUrl: "https://example.com/ux-research",
            freePreview: false,
          },
        ],
        isPublised: true,
      },
    ];

    // Clear existing courses
    await Course.deleteMany({});
    console.log("🗑️  Cleared existing courses");

    // Insert sample courses
    const result = await Course.insertMany(sampleCourses);
    console.log(`✅ Seeded ${result.length} courses successfully!`);

    // List all courses
    const allCourses = await Course.find({});
    console.log(`📚 Total courses in database: ${allCourses.length}`);
    allCourses.forEach((course) => {
      console.log(`  - ${course.title} (${course.category}) - $${course.pricing}`);
    });

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedCourses();
