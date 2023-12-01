import { feathers } from "@feathersjs/feathers";
import {
  koa,
  rest,
  bodyParser,
  errorHandler,
  serveStatic,
} from "@feathersjs/koa";
import socketio from "@feathersjs/socketio";
import createClient, { createHttpClient } from "edgedb";
import { EdgeDBService } from "./index";

// This tells TypeScript what services we are registering
type ServiceTypes = {
  user: EdgeDBService;
  asset: EdgeDBService;
  area: EdgeDBService;
  zone: EdgeDBService;
  area_cluster: EdgeDBService;
};

// Creates an KoaJS compatible Feathers application
const app = koa<ServiceTypes>(feathers());

// Use the current folder for static file hosting
app.use(serveStatic("."));
// Register the error handle
app.use(errorHandler());
// Parse JSON request bodies
app.use(bodyParser());

// Register REST service handler
app.configure(rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register our messages service
app.use(
  "user",
  new EdgeDBService({
    client: createHttpClient(),
    Model: "User",
    paginate: false,
  })
);

app.use(
  "asset",
  new EdgeDBService({
    client: createHttpClient(),
    Model: "Asset",
    paginate: false,
  })
);

app.use(
  "area",
  new EdgeDBService({
    client: createHttpClient(),
    Model: "Area",
    paginate: false,
  })
);

app.use(
  "zone",
  new EdgeDBService({
    client: createHttpClient(),
    Model: "Zone",
    paginate: false,
  })
);

app.use(
  "area_cluster",
  new EdgeDBService({
    client: createHttpClient(),
    Model: "Area_Cluster",
    paginate: false,
  })
);

// Add any new real-time connection to the `everybody` channel
app.on("connection", (connection) => app.channel("everybody").join(connection));
// Publish all events to the `everybody` channel
app.publish((_data) => app.channel("everybody"));

// Start the server
app
  .listen(3030)
  .then(() => console.log("Feathers server listening on localhost:3030"));
