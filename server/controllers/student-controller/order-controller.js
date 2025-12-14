const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const Group = require("../../models/Group");

// Generate unique join code for groups
const generateJoinCode = async () => {
  const createCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  while (true) {
    const code = createCode();
    const exists = await Group.findOne({ joinCode: code });
    if (!exists) return code;
  }
};

// Get or create course group
const getOrCreateCourseGroup = async (courseId, instructorId, courseTitle) => {
  try {
    // Check if group already exists for this course
    let group = await Group.findOne({ courseId });
    
    if (group) {
      return group;
    }

    // Create new group if it doesn't exist
    const joinCode = await generateJoinCode();
    const newGroup = new Group({
      name: `${courseTitle} Group`,
      description: `Study group for ${courseTitle}`,
      joinCode,
      createdBy: instructorId,
      members: [],
      courseId,
      active: true,
    });

    await newGroup.save();
    return newGroup;
  } catch (err) {
    console.error("Error in getOrCreateCourseGroup:", err);
    return null;
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      paymentId,
      payerId,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/payment-return`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courseTitle,
                sku: courseId,
                price: coursePricing,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: coursePricing.toFixed(2),
          },
          description: courseTitle,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment!",
        });
      } else {
        const newlyCreatedCourseOrder = new Order({
          userId,
          userName,
          userEmail,
          orderStatus,
          paymentMethod,
          paymentStatus,
          orderDate,
          paymentId,
          payerId,
          instructorId,
          instructorName,
          courseImage,
          courseTitle,
          courseId,
          coursePricing,
        });

        await newlyCreatedCourseOrder.save();

        const approveUrl = paymentInfo.links.find(
          (link) => link.rel == "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          data: {
            approveUrl,
            orderId: newlyCreatedCourseOrder._id,
          },
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    await order.save();

    //update out student course model
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: order.orderDate,
        courseImage: order.courseImage,
      });

      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    //update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    // Get or create course group and get join code
    let groupJoinCode = null;
    try {
      const course = await Course.findById(order.courseId);
      const group = await getOrCreateCourseGroup(
        order.courseId,
        order.instructorId,
        order.courseTitle
      );
      if (group) {
        groupJoinCode = group.joinCode;
      }
    } catch (err) {
      console.log("Error fetching/creating group join code:", err);
    }

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
      groupJoinCode,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Direct enrollment without PayPal (bypass payment)
const directEnrollCourse = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    } = req.body;

    // Create order with "completed" status
    const newOrder = new Order({
      userId,
      userName,
      userEmail,
      orderStatus: "confirmed",
      paymentMethod: "direct",
      paymentStatus: "paid",
      orderDate: new Date(),
      paymentId: "DIRECT_ENROLLMENT",
      payerId: "SYSTEM",
      instructorId,
      instructorName,
      courseImage,
      courseTitle,
      courseId,
      coursePricing,
    });

    await newOrder.save();

    // Update student courses
    const studentCourses = await StudentCourses.findOne({ userId });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId,
        title: courseTitle,
        instructorId,
        instructorName,
        dateOfPurchase: new Date(),
        courseImage,
      });
      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId,
        courses: [
          {
            courseId,
            title: courseTitle,
            instructorId,
            instructorName,
            dateOfPurchase: new Date(),
            courseImage,
          },
        ],
      });
      await newStudentCourses.save();
    }

    // Update course students list
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: {
        students: {
          studentId: userId,
          studentName: userName,
          studentEmail: userEmail,
          paidAmount: coursePricing,
        },
      },
    });

    // Get or create course group and get join code
    let groupJoinCode = null;
    try {
      const group = await getOrCreateCourseGroup(
        courseId,
        instructorId,
        courseTitle
      );
      if (group) {
        groupJoinCode = group.joinCode;
      }
    } catch (err) {
      console.log("Error fetching/creating group join code:", err);
    }

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: newOrder,
      groupJoinCode,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error enrolling in course",
    });
  }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder, directEnrollCourse };
