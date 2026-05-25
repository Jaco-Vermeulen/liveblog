# Liveblog — host-based development (optional)

Use this only if you are **not** using `docker compose up`. Databases can still run in Docker:

```sh
docker compose up -d mongodb redis elasticsearch
```

## Ubuntu 20.04

### System dependencies

```sh
sudo apt install \
  python3 python3-dev python3-pip python3-lxml \
  build-essential libffi-dev git \
  libtiff5-dev libjpeg8-dev zlib1g-dev \
  libfreetype6-dev liblcms2-dev libwebp-dev \
  curl libfontconfig libssl-dev libbz2-dev \
  libncurses5-dev libreadline-dev libsqlite3-dev \
  nodejs npm
```

### Python 3.6.15 (pyenv)

```sh
curl https://pyenv.run | bash
pyenv install 3.6.15
cd server
pyenv virtualenv 3.6.15 env
pyenv activate env
pip install -r requirements.txt
```

### Server

```sh
python3 manage.py app:initialize_data
python3 manage.py users:create -u admin -p admin -e 'admin@example.com' --admin
python3 manage.py register_local_themes
honcho -f ../docker/Procfile-dev start
```

### Client

```sh
cd client
npm install
grunt --force server --server='http://localhost:5000/api' --ws='ws://localhost:5100'
```

Open http://localhost:9000 (admin / admin).

Mac OS: [README-macos.md](README-macos.md)
