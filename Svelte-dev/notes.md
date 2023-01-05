# Make use of https
to use https generate a cert(localhost) and update **package.json** with

    //"start": "sirv public --no-clear --single --http2 --port 8080 --cert ./localhost.pem --key ./localhost-key.pem"