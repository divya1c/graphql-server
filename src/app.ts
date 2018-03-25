import * as express from 'express';

class App {

  public express: express.Application;

  constructor() {
    this.express = express();
    this.routes();
  }

  private routes(): void {
    let router = express.Router();
    router.get('/', (req, res, next) => {
      console.log("request received");
      res.json({
        message: 'Hello World!'
      });
    });
    this.express.use('/', router);
  }
}

export default new App().express;