in this dir you need to add a cert and a key for HTTPS to work

for example run:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/selfsigned.key -out nginx/ssl/selfsigned.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"