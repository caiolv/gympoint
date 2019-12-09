import * as Yup from 'yup';
import Plan from '../models/Plan';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const plans = await Plan.findAll({
      order: [['price', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .required()
        .positive()
        .integer(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number()
        .positive()
        .integer(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist. ' });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist. ' });
    }

    plan.canceled_at = new Date();

    await Plan.destroy({
      where: { id },
    });

    return res.json(plan);
  }
}

export default new EnrollmentController();
