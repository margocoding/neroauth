import validationMiddleware from "../../../middlewares/validation.middleware.js";
import { localeMiddleware } from "../../../utils/dto/locale.dto.js";

export const applyInvitationMiddleware = [
    ...localeMiddleware,
    validationMiddleware
]