# Boochat

## Developing

Once you've installed the dependencies with `yarn install`, start a development server:

```bash
yarn dev
```

## Building

Run:

```bash
yarn build

# To start the production server:
yarn nodemon
```

## Create the database

```bash
# Create an empty database:
yarn prisma db push

# Populate it with data:
yarn prisma db seed --preview-feature
```
