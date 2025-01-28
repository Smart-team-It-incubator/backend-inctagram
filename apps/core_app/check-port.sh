PORT=$1
TIMEOUT=5
HOST="smtp.example.com" # Замените на хост SMTP-сервера или оставьте локальный IP

echo "Checking if port $PORT is available on $HOST..."

if timeout $TIMEOUT bash -c "</dev/tcp/$HOST/$PORT"; then
  echo "Port $PORT is available. Proceeding..."
else
  echo "Port $PORT is not available. Exiting..."
  exit 1
fi