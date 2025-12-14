const express = require("express");
const {
  createOrder,
  capturePaymentAndFinalizeOrder,
  directEnrollCourse,
} = require("../../controllers/student-controller/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePaymentAndFinalizeOrder);
router.post("/direct-enroll", directEnrollCourse);

module.exports = router;
