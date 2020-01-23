import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      order: [['start_date', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price', 'student_id', 'plan_id'],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }

    const { plan_id, start_date, student_id } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(404).json({ error: "Student could not be found." });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(404).json({ error: "Plan could not be found." });
    }

    const studentAlreadyEnrolled = await Enrollment.findOne({
      where: { student_id }
    });

    if (studentAlreadyEnrolled) {
      return res.status(400).json({ error: "Student alredy enrolled." });
    }

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date: addMonths(parseISO(start_date), plan.duration),
      price: plan.getTotalPrice()
    });

    return res.json({enrollment});
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      plan_id: Yup.number(),
      student_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails!' });
    }
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Plan does not exist. ' });
    }

    const { plan_id, start_date, student_id } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(404).json({ error: "Student could not be found." });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(404).json({ error: "Plan could not be found." });
    }

    const { start_date, plan_id, student_id } = await enrollment.update(req.body);

    return res.json({
      start_date,
      plan_id,
      student_id,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist. ' });
    }

    enrollment.canceled_at = new Date();

    await Enrollment.destroy({
      where: { id },
    });

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
