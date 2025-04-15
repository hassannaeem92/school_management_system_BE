const express = require('express');
const cors = require('cors');
const router_role = require("./routes/route_role");
const classRouter = require("./routes/route_class");
const sectionRouter = require('./routes/route_section');
const teacherRouter = require('./routes/route_teacher');
const studentRouter = require('./routes/route_student');
const feeRouter = require('./routes/route_fee');
const userRouter = require('./routes/route_user');
const miscRouter = require('./routes/route_misc');
const parentRouter = require('./routes/route_parent');
const instituteRouter = require('./routes/route_institute');
const guardianRouter = require('./routes/route_guardian');
const receiverRouter = require('./routes/route_receiver');
const dashboardRouter = require('./routes/route_dashboard');
const thumbRouter = require('./routes/route_thumb');
const sessionRouter = require('./routes/route_session');
const path = require("path");
const semesterRouter = require('./routes/route_semester');
const degreeRouter = require('./routes/route_degree');
const subjectRouter = require('./routes/route_subjects');
const subjectSemesterRouter = require('./routes/route_subject_semester_mapping');
const app = express();
app.use(cors());
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use("/student_images",express.static(path.join(__dirname, "public/student_images")));
// app.use(express.static(path.join(__dirname, "public")));


// app.use("/api/role", router_role);
app.use("/api/class", classRouter);
app.use("/api/section", sectionRouter);
app.use("/api/admin/teacher", teacherRouter);
app.use("/api/admin/student", studentRouter);
app.use("/api/fee", feeRouter);
app.use("/api/admin", userRouter);
app.use("/api/admin/misc/get", miscRouter);
app.use("/api/admin/student/parent",parentRouter);
app.use("/api/admin/institute", instituteRouter);
app.use("/api/admin/student/guardian", guardianRouter);
app.use("/api/admin/student/receiver", receiverRouter);
app.use("/api/admin/analytics", dashboardRouter);
app.use("/api/admin/thumb", thumbRouter);
app.use("/api/admin/sessions", sessionRouter);
app.use("/api/admin", degreeRouter);
app.use("/api/admin", semesterRouter);
app.use("/api/admin", subjectRouter);
app.use("/api/admin", subjectSemesterRouter);



app.use(express.static("./public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(express.static("./public"));
app.use('/parents_picture', express.static(path.join(__dirname, 'public/parents_picture')));

app.use(express.static("./public"));
app.use('/company_logo', express.static(path.join(__dirname, 'public/company_logo')));

app.use(express.static("./public"));
app.use('/thumb', express.static(path.join(__dirname, 'public/thumb')));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
