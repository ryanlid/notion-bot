import { Request, Response, NextFunction } from "express";

export const getInfo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.send({
    status: "OK",
    clientIp: req.ip,
    clientIps: req.ips,
    hostname: req.hostname,
    protocol: req.protocol,
    connectionRemoteAddress: req.connection.remoteAddress,
  });
};
