# Bookmarker

![Logo](https://raw.githubusercontent.com/tonnie17/Bookmarker/master/app/www/bookmark.png)

一个轻便的Hybrid书签应用，使用AngularJS+ionic+cordova+electron开发。

[演示地址](http://ivwsyygyfnhv-lbm.daoapp.io/)


![mobile](http://7xq6ov.com1.z0.glb.clouddn.com/2026984FCF4E2C15113013555787542C.jpg)

![desktop](http://7xq6ov.com1.z0.glb.clouddn.com/C1C80B1C-6B89-47DC-A6E7-265B1D8F34F8.jpg)

# 部署

## 本地

替换app.js的API_URL，启动ionic服务器:

```
cd app/
ionic serve
```

启动Django REST服务:

```
pip3 install -r requirement.txt
python3 bookmarker/manage.py runserver 0.0.0.0:8000
```

## Docker

构建运行容器:

```
sh build_docker.sh
```

构建数据库表:

```
docker-compose run web /bin/sh -c 'python3 app/manage.py migrate'
```
