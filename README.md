# <img src="./static/icons/boochat.svg" alt="Boochat icon" height="40" valign="bottom"> Boochat

## Try it!

```bash
# Clone and run
git clone https://github.com/GauBen/boochat.git
cd boochat
docker-compose up
```

## Development

```bash
# Install the dependencies
yarn install

# Prepare the environment (create and populate an sqlite database)
cp .env.example .env
yarn prisma db push
yarn prisma db seed

# Start the development server
yarn dev
```

## Production

Customize the `.env` file, create and populate the database (`yarn prisma db push && yarn prisma db seed`) and run `docker-compose up`.

If you want to run Boochat on bare metal instead of docker, run `yarn build && yarn start`.
