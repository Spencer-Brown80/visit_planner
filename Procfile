web: npm run build --prefix client && serve -s client/dist
api: gunicorn -b 0.0.0.0:5555 --chdir ./server config:app