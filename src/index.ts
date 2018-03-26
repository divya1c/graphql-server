import app from './app';
import { makeExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
var bodyParser = require('body-parser');
import { createConnection } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { FruitBasket } from './entity/FruitBasket';
import { Apple } from './entity/Apple';

const port = 4354;
export const pubsub = new PubSub();
const FRUITBASKET_ADDED_TOPIC = 'fruitbasketAdded';
const typeDefs = importSchema("./src/schema.graphql");

interface fruitBasket {
  id: number;
  numFruits: number;
  name: string;
}

interface apple {
  id: number;
  color: string;
  size: string;
}

createConnection({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  database: "graphql",
  entities: [
    FruitBasket,
    Apple
  ],
  synchronize: true
}).then(async connection  => {
  const resolvers = {
    Query: {
      allFruits: async () => {
        let allFruitBaskets = await FruitBasket.find();
        return allFruitBaskets;
      }
    },
    fruitBasket: {
      apples: async (fruitBasket) => {
        let apples = await Apple.find ({where: {"fruitbasketId": fruitBasket.id}});
        return apples;
      }
    },
    /* To run mutation from graphiql, example:
    mutation {
      createFruitBasket(numFruits: 20, name: "bananas") {
    		id
      }
    } */
    Mutation: {
      createFruitBasket: async (_, { numFruits, name }) => {
        console.log(`numFruits: ${numFruits}, name: ${Object.keys(name)}`);
        let fb = new FruitBasket();
        fb.numFruits = numFruits;
        fb.name = name;
        await fb.save();
        console.log(fb);
        pubsub.publish(FRUITBASKET_ADDED_TOPIC, {FRUITBASKET_ADDED_TOPIC: fb});
        return fb;
      }
    },
    /* To subscribe from graphiql,
    subscription {
      fruitBasketAdded {
        id
      }
    } */
    Subscription: {
      fruitBasketAdded: {
        subscribe: () => pubsub.asyncIterator(FRUITBASKET_ADDED_TOPIC),
      }
    }
  };

  const myGraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  app.use("/graphql", bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));
  // GraphiQL, a visual editor for queries
  app.use("/graphiql", graphiqlExpress({ 
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://localhost:4354/subscriptions`
  }));
  const server = createServer(app);
  server.listen(port, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema: myGraphQLSchema,
    }, {
      server: server,
      path: '/subscriptions',
    });
    console.log('Server listening on port 4354. Go to localhost:4354/graphiql for accessing graphiql.');
  });
}, (err) => {
  console.log('Database create connection failed!');
  console.log(err);
});