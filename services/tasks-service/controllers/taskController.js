const catchAsync = require("../middlewares/catchAsync");

const getTarefa = () => {
  return require("../models/Tarefa");
};

module.exports = {
  createTask: catchAsync(async (req, res) => {
    const { title, description, deadline, status } = req.body;
    const userId = req.usuario.id;

    const Tarefa = getTarefa();
    const novaTarefa = await Tarefa.create({
      title,
      description,
      deadline,
      userId,
      status: status || 'todo'
    });

    res.status(201).json(novaTarefa);
  }),

  getTasks: catchAsync(async (req, res) => {
    const userId = req.usuario.id;
    const Tarefa = getTarefa();

    const tarefas = await Tarefa.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(tarefas);
  }),

  getTaskById: catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.usuario.id;

    const Tarefa = getTarefa();
    const tarefa = await Tarefa.findOne({
      where: { id, userId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json(tarefa);
  }),

  updateTask: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, deadline, status } = req.body;
    const userId = req.usuario.id;

    const Tarefa = getTarefa();
    const tarefa = await Tarefa.findOne({
      where: { id, userId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (status !== undefined) updateData.status = status;

    await tarefa.update(updateData);

    res.json(tarefa);
  }),

  updateTaskStatus: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.usuario.id;

    const Tarefa = getTarefa();
    const tarefa = await Tarefa.findOne({
      where: { id, userId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    await tarefa.update({ status });

    res.json(tarefa);
  }),

  deleteTask: catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.usuario.id;

    const Tarefa = getTarefa();
    const tarefa = await Tarefa.findOne({
      where: { id, userId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    await tarefa.destroy();

    res.json({ message: "Tarefa excluída com sucesso" });
  })
};
