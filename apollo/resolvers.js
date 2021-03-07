export const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return "Hello world!";
    },
  },
};
