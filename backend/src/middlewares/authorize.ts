import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Você não tem permissão para acessar este recurso" });
    }

    return next();
  };
}