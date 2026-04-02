import { query } from "express-validator";

export const paginationMiddleware = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("pageSize").optional().isInt({ max: 200 }).toInt(),
];
