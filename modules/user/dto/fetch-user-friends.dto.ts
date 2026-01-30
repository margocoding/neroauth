import validationMiddleware from "../../../middlewares/validation.middleware.js";
import { paginationMiddleware } from "../../../utils/dto/pagination.dto.js";
import { fetchUserMiddleware } from "./fetch-user.dto.js";

export const fetchUserFriendsMiddleware = [
  ...paginationMiddleware,
  ...fetchUserMiddleware,
];
