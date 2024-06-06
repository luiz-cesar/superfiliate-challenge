import { Request, Response } from "express";
import { ZodError, ZodSchema, infer as ZodInfer } from "zod";

export enum RequestMethod {
  GET = "get",
  // Add more here as needed
}

export enum ResponseStatus {
  "Success" = 200,
  "BadRequest" = 400,
  "Unknown" = 500,
  // Add more here as needed
}

type EndpointConfig<T extends ZodSchema> = {
  path: string;
  method: RequestMethod;
  handler: (data: ZodInfer<T>) => { status: ResponseStatus; resource: any };
  validator: T;
};

// A wrapper for endpoints to consolidate types, handle errors and do common operations such as body validation
export function buildEndpointRegister<T extends ZodSchema>({
  path,
  method,
  handler,
  validator,
}: EndpointConfig<T>) {
  return {
    path,
    method,
    originalHandler: handler,
    handler: (request: Request, response: Response) => {
      try {
        const requestData = validator.parse(request.body);

        const { status, resource } = handler(requestData);

        return response.status(status).send(resource);
      } catch (error) {
        if (error instanceof ZodError) {
          response.status(ResponseStatus.BadRequest).send(error);
          return;
        }

        console.error(error);
        response.status(ResponseStatus.Unknown).send(error);
      }
    },
  };
}
