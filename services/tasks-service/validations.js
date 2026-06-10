const { z } = require("zod");
const { VALID_TASK_STATUSES } = require("./utils/constants");

const createTaskSchema = z.object({
  title: z.string().min(1, "Título da tarefa é obrigatório"),
  description: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
  deadline: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    return null;
  }, z.date().refine(date => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadlineDateOnly = new Date(date);
    deadlineDateOnly.setHours(0, 0, 0, 0);
    return deadlineDateOnly >= now;
  }, { message: "Não é possível definir uma data que já passou" }).optional().nullable()).or(z.union([z.null(), z.literal("")]).transform(() => null)),
  status: z.enum(VALID_TASK_STATUSES).optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Título da tarefa é obrigatório").optional(),
  description: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
  deadline: z.preprocess((arg) => {
    if (arg === null || arg === '') return null;
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    return null;
  }, z.date().refine(date => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadlineDateOnly = new Date(date);
    deadlineDateOnly.setHours(0, 0, 0, 0);
    return deadlineDateOnly >= now;
  }, { message: "Não é possível definir uma data que já passou" }).optional().nullable()).or(z.union([z.null(), z.literal("")]).transform(() => null)),
  status: z.enum(VALID_TASK_STATUSES).optional()
});

const updateTaskStatusSchema = z.object({
  status: z.enum(VALID_TASK_STATUSES, { required_error: "Status é obrigatório" })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema
};
