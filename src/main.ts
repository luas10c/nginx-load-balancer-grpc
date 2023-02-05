import {
  Server,
  ServerCredentials,
  loadPackageDefinition,
} from "@grpc/grpc-js";
import { load } from "@grpc/proto-loader";
import { resolve } from "path";

import * as env from "./env";

async function bootstrap() {
  const server = new Server();

  const proto = await load(resolve(__dirname, "user.proto"));
  const { user } = loadPackageDefinition(proto) as any;

  server.addService(user.AppService.service, {
    hello(call, done) {
      console.log(env.INSTANCE_NAME);

      return done(null, {
        instance: env.INSTANCE_NAME,
      });
    },
  });

  const { url } = await new Promise<{ url: string }>((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${env.PORT}`,
      ServerCredentials.createInsecure(),
      (error, port) => {
        if (!error) {
          server.start();
          resolve({
            url: `0.0.0.0:${port}`,
          });
          return;
        }

        reject(error);
      }
    );
  });

  console.log(url);
}

bootstrap();
