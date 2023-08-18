# DIS23-b
Data Intern Summer 2023 Team B

## Install
```bash
$ git clone https://github.com/gochipon/DIS23-b
$ cd DIS23-b
$ sudo docker compose build
```

## Run
```bash
$ docker compose up
```

## development
```bash
# front
$ docker compose exec front /bin/bash

# api
$ docker compose exec api /bin/bash
```

## branch
- issueドリブンを採用
    - 例: #5_install_fastapi
- 参考
    - https://qiita.com/takahirocook/items/6ac94e5dc6536bd2272c
