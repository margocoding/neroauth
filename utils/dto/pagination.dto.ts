import { query } from "express-validator";

export const paginationMiddleware = [
  query("page").optional().isInt().toInt(),
  query("pageSize").optional().isInt().toInt(),
];
