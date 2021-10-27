if [ ! -f '.env' ]
then
  echo ".env file not found, using the default (with sqlite)"
  cp .env.example .env
  yarn prisma db push
  yarn prisma db seed
fi

echo 'Starting the production server...'
yarn start
