---
title: docker使用指南
date: 2022-09-10 16:20
headimg: https://images.unsplash.com/photo-1681913783675-081428f1ac9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80
---
##  1.docker环境搭
### 1.1 Virtual Box && Vagrant安装虚拟机

**vagrant**命令创建虚机

```bash
# 查看版本
vagrant version

# 初始化Vagrantfile文件
vagrant init centos/7

# 安装并启动虚拟机,第一次是安装.会从本地找base box,如果本地没有,会从网上下载,网速极慢
vagrant up

# 通过ssh进入virtual mechine
vagrant ssh

exit

# 查看虚拟机状态
vagrant status

# 关闭虚拟机(耗时)
vagrant halt

vagrant reload
vagrant box list

# 删除虚拟机
vagrant destroy

# plugin
vagrant plugin list
vagrant plugin install vagrant-scp
vagrant scp 本地目录 主机名:目录
```

使用小技巧: 

1. 不要在本地学习使用docker

2. 可从Vagrant Cloud寻找vagrantfile配置使用
3. 可在vagrantfile末尾添加shell脚本,vagrant up之后会自动执行

### 1.2 Centos上安装Docker

[docker官网]: https://docs.docker.com/install/linux/docker-ce/centos/

卸载旧版本

```bash
# 进入虚拟机,当有多个主机时可以指定主机名
vagrant ssh

# 卸载旧版本docker
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

1. 下载依赖包

   ```bas
     sudo yum install -y yum-utils \
     device-mapper-persistent-data \
     lvm2
   ```

2. 添加repo

   ```bash
   sudo yum-config-manager \
       --add-repo \
       https://download.docker.com/linux/centos/docker-ce.repo
   ```

3. 下载CE版

   ```bash
   sudo yum install docker-ce docker-ce-cli containerd.io
   ```

4. 启动docker

   ```bash
   sudo systemctl start docker
   ```

5. hello world

   ```bash
   # 本地没有镜像时会从docker hub下载
   sudo docker run hello-world
   ```

   
看到一长串的黑客帝国一样的代码输出了Hello from Docker恭喜你,安装成功,可以开心使用了
   
   

### 1.3 Docker Machine本地使用

自动在虚拟机安装docker-engine的工具,mac版本会自动下载

****

**Docker Machine命令**

​```bash
docker-machine version

#### 创建linux虚机demo
docker-machine create demo

#### 列出当前已创建好的machine
docker-mechine ls

#### 进入虚机 查看docker版本
docker-machine ssh demo
docker version

#### 停掉虚机
docker-machine stop demo

#### 查看demo的环境变量 (通过本地docker远程管理docker-machine)
docker-machine env demo

#### 加载环境变量
eval $(docker-machine env demo)
### 1.4 Docker Playground

直接使用安装好了docker的环境

免费使用: https://labs.play-with-docker.com/

## 2.Docker镜像&容器

[docker命令](http://www.imooc.com/article/292859#Registry%E5%AE%9E%E8%B7%B5)

### 2.1 Docker架构

Docker Engine:

- 后台进程(dockerd)

- REST API Server

- CLI接口(docker)

![](http://cdn.qdovo.com/uploads/2021/12/18/img_0037.png)

**底层技术支持(linux已存在的技术)**

NameSpaces: 隔离pid,net,ipc,mnt,uts

Control groups: 资源限制

Union file systems: Container和image的分层

### 2.2 Docker Image

文件和meta data的集合(root filesystem)

分层的,每一层可以添加改变删除文件,成为一个新的image

不同的image可以共享相同的layer

Image只读

![](http://cdn.qdovo.com/uploads/2021/12/18/img_0039.jpg)

**常用命令**

```bash
# 查看本地image
docker image ls = docker images
# 查看镜像分层
docker history 镜像id
# 搜索镜像
docker search [image name]

# 移除镜像
docker image rm [imageID] = docker rmi [imageID]
# 批量移除镜像--移除所有
docker rmi $(docker images -q)
# 按关键字移除,其中doss-api为关键字
docker rmi --force `docker images | grep doss-api | awk '{print $3}'`  

# 运行容器
docker (container) run 镜像REPOSITORY
```

### 2.3 Image的获取

1. Build from Dockerfile

```dockerfile
# base Image
FROM ubuntu:14.04
```

2. Pull from Registry

```bash
sudo docker pull ubuntu:14.04
```

避免每次sudo

```bash
sudo groupadd docker
sudo gpasswd -a vagrant docker
sudo service docker restart
# 要重启ssh
```

### 2.4 Container

通过Image创建

在Image layer之上建立container layer可读写层

类和实例的关系

Image负责app的存储和分发,Container负责运行app

**常用命令**

```bash
# 列举本地当前正在运行的容器
docker container ls = docker ps

# 列举本地当前所有的容器
docker container ls -a

# 移除容器
docker (container) rm 容器id(不用写全) # -f 强制删除

#列举id
docker container ls -aq

# 1.生成容器且在后台执行,本地没有image时会远程抓取
docker (container) run --name [NAME] -d [image]
# 还可指定容器运行后执行的命令，单条命令在最后写上如npm install
# 多条命令 /bin/sh -c ''

# 2.另外一种常见命令行工具的构建
ENTRPOINT ["/usr/bin/stress"]
CMD []	# 接收docker run传递的参数

# 运行参数
-d 后台运行容器
-p port1:port2	将本虚机端口1映射到容器端口2,外网可通过端口1访问
--name demo		指定名称
-e/--env	指定环境变量, 每一个环境变量输入一个-e 如 -e USER_NAME=xxx

默认端口:
ftp: 21
ssh: 22
nginx: 80
mysql: 3306
redis: 6379

# 数据卷操作
docker volume ls

```

yum命令报错,加sudo即可

```bas
Failed to set locale, defaulting to C
Loaded plugins: fastestmirror
You need to be root to perform this command
```

### 2.5 构建镜像的方式

- docker commit	从容器的改变创建镜像(不推荐使用)

```bash
docker commit 容器NAMES 镜像REPOSITORY(:TAG)
```

- docker (image) build	从Dockerfile构建

  镜像NAME[:TAG]必须是docker hub的(或自建registry的)id/名称

```bash
docker build -t [NAME][:TAG] .
# 点表示基于当前目录的Dockerfile进行build,本身image是只读的,执行yum install等读写的原理是临时生成容器commit成镜像,再删除临时容器
```

### 2.6 Dockerfile语法

**FROM**

`FROM scratch`	从头制作Image

**LABEL** 

定义Image的meta data

**EXPOSE**

暴露容器端口供外部访问

**RUN**

```docker
RUN yum update && yum install -y vim \ python-dev
#  &&避免无用分层,反斜线换行
```

**WORKDIR**	设定当前工作目录

```docker
WORKDIR /test
# 如果没有会自动创建目录
```

用WORDDIR,不推荐使用 RUN cd

尽量使用绝对目录

**ADD and COPY**

把本地文件添加到Docker Image里面,区别是ADD还能解压缩

```doc
WORKDIR /ROOT
ADD hello /test/	# .表示所有文件
# /root/test/hello
```

大部分情况COPY 优于ADD

添加远程文件/目录使用curl或wget

**ENV **  通过设置环境变量生成常量

```dock
ENV MYSQL_VERSION 5.6
# 设置常量
```

官方Dockerfile: github.com/docker-library

#### tips

1.用WORKDIR 不要用 RUN cd

2.RUN执行命令并创建新的image layer,为了美观,使用反斜线换行,另外为避免无用分层,合并多行命令成一行

3.ADD/COPY如果添加/拷贝的是文件夹,只会添加/拷贝文件夹里的内容

### 2.7 RUN vs CMD vs ENTERPOINT

![](http://cdn.qdovo.com/uploads/2021/12/18/img_0050.png)

通过Exec格式,并不是在shell执行echo,只是单纯执行echo,需要指明要运行的命令是通过shell运行

```bash
FROM centos
ENV name docker
ENTRPOINT ["/bin/bash","-c","echo hello $name"]
#或
ENTERPOINT ["xxx.sh"]  # 在sh中指定解释器
```



RUN:    执行命令并创建新的Image Layer

CMD:   

设置容器启动后默认执行的命令和参数

如果docker run指定了其他命令,CMD会被忽略

```dockfile
FROM centos
ENV name Docker
CMD echo "hello $name"
docker run -it [image] /bin/bash
# -it,以交互模式运行container
# 不会输出
```

如果定义了多个CMD,只有最后一个会被执行

 ENTRYPOINT:   设置容器启动时运行的命令

让容器以应用程序或者服务的形式运行

不会被忽略,一定会执行

> Shell 格式 和 Exec格式

```dockerfile
RUN apt-get install -y vim
```

```dockerfile
RUN ["apt-get","install","-y","vim"]
```

#### tips

添加远程文件/目录使用curl或者wget

### 2.8 镜像的发布

注意: push的镜像NAME[:TAG]必须是docker hub id/名称

```bash
docker login

docker (image) push NAME[:TAG]

```

测试远程服务器端口是否通畅

telnet ip port

注意: 没有冒号

### 2.9 容器的操作

```bash
# 运行容器参数,name也是唯一标识,可通过image或name进行容器操作
--name demo

# 进入运行的容器里面
docker exec -it [容器id] [命令如/bin/bash]

# 关闭容器
docker (container) stop 容器id

# 终止正在运行的容器
docker container kill [containerID]

# 启动容器[name]
docker start [容器id]/[name]

# 返回容器的信息对象
docker inspect [容器id]

# 查看运行容器产生的输出
docker logs [container id]
```

### 2.10对容器进行资源限制

```bash
docker run [参数,如memory]
```

### 2.11 docker machine

在虚拟机(可以是远程的)上安装docker的工具,且可以管理docker主机

```bash
docker-machine version	# 虚机中要单独安装

# 创建Docker 主机
docker-machine create 虚机名字

docker-machine ls

docker-machine ssh
```



##Tips:  

.dockerignore过滤文件

EXPOSE: 将容器内的端口导出供外部访问

ping: 检查ip可达性

telnet: 验证服务可用性	

```bash
talnet 172.17.0.2 80
```

## 3. Docker Network

容器联网的原理:

linux主机是通过eth0接口连接互联网,docker0 bridge是本机(虚机,宿主机)在docker内的Namespace,docker0下的容器的Namespace是虚拟的,以veth开头,和容器的eth0是一对veth-pair,并且通过veth...显式的连接到docker0上,可用brctl show验证(下载bridge-utils).最终通过NAT技术转换(查询ip tables),通过linux主机的eth0连接互联网

注意: brctl show 返回的bridge name显示的不是docker network ls自己设置的名字如demo,而是br-networkID

Network nameSpace操作

```bash
sudo ip netns list
sudo ip netns add test1
sudo ip netns delete test1
# 进入network namespace查看ip
sudo ip netns exec test1 ip a
```
查看bridge

docker0这个bridge的network namespace是虚拟机本机的network namespace

```bash
ip a
```

![](http://cdn.qdovo.com/uploads/2021/12/18/img_0052.png)

```bash
# 列举当前机器的网络: bridge host none,对应的drive分别为bridge, host, null
docker network list
# 返回容器和bridge网络信息,默认连接到bridge,返回网络信息的对象{Containers: {}},自定义创建的network在指定network或者connect之前没有Containers信息
docker network inspect [network ID / NAME如bridge]

# 创建network,
docker network create -d(drive) bridge my-bridge
#  查看本地bridge, 没有容器与其link时,无interfaces
brctl show

#新建容器关联network,此时该bridge有了interface,即一对veth接口
docker run -d --name test --network my-bridge test
#已存在的容器关联etwork,可以连接到多个bridge
docker connect my-bridge test
```

两个network namespace通过一对veth pair连接到docker0相互通信(容器默认的bridge)

![](http://cdn.qdovo.com/uploads/2021/12/18/img_0051.jpg)

## 4. Docker的持久化存储

1.基于本地文件系统的Volume,通过-v参数将主机目录作为容器的数据卷

2.基于plugin的Volume,如NAS,aws

Volume类型

受管理的data Volume,docker后台自动创建

绑定挂载的Volume,挂载位置用户指定

```dockerfile
VOLUME /var/lib/mysql
```

```bash
# Data Volume
docker run -d -v mysql-data(volume别名):/var/lib/mysql(虚机本地路径) --name mysql1 mysql

# Bind Mouting
docker run -v 本地目录:容器内目录

# 常用命令
docker volume ls
docker volume inspect [VOLUME NAME](默认是一串字母数字)
```



## 5. Docker Compose

通过yaml配置文件管理多个docker容器组成的应用的命令行工具

用于本地开发而非部署生成环境app的工具

- Services

一个service代表一个container, 可以从dockerhub/其他远程的hub的image创建或从本地的Dockerfile build出来的image创建,如./work表示Dockerfile在yaml文件下的work目录中

- Networks,启动类似于docker run,可以指定引用

- Volumes,可以指定引用



容器每次部署或启动ip地址会发生变化,内网ip默认为172.17.xx.xx.容器默认连接的网络是docker0 bridge,容器间相互通信需要互相links,避免因ip改变而无法连接,即将被废弃.

使用network可以创建自定义的网络,默认的drive为bridge.可以指定一个别名,相当于在容器的/etc/hosts创建.加入同一个网络中的容器之间可以通过服务名:端口或在network中设置的别名:端口互相访问

```bash
# compose 下载之后通过管道的方式输入至 /usr/local/bin/docker-compose
# uname -s 查找是什么系统，例如：Linux
# uname -m 查找是什么版本，例如：x86_64
$ curl -L https://github.com/docker/compose/releases/download/1.25.0-rc2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

# 把这个文件变成可执行的
$ chmod +x /usr/local/bin/docker-compose
```

查看是否安装成功

```bash
docker-compose --version
```

操作服务

```bash
# 要在yaml同级目录下执行
docker-compose up -d

docker-compose stop
```



```yaml
version: '3'

services:

  wordpress:
    image: wordpress
    # build: 
    #		context: .
    #		dockerfile: Dockerfile
    ports:
      - 8080:80
    depends_on:
      - mysql
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_PASSWORD: root
    networks:
      - my-bridge	# 指定引用

  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: wordpress
    volumes:
      - mysql-data:/var/lib/mysql		# 可以不定义mysql-data别名
    networks:
      - my-bridge

volumes: # 定义
  mysql-data:

networks:
  my-bridge:
    driver: bridge
```

## 6.Docker Swarm

```bash
#初始化manage
docker swarm init --advertise-addr=1920168.0.13

# 将worker加入swarm
docker swarm join --token ...

# 查看节点,manage node才能运行
docker node ls

# service篇--manage node中运行
# 创建service
docker service create -d(后台执行) --name(service名字而非容器名字) demo busybox(镜像名)

# 查看service列表
docker service ls	# mode: replicated(水平扩展)； replicas: 1/1(表示水平扩展, ready数量/scale数量)

# 查看service/容器详细信息,包括处于哪个node中
docker service ps demo

# 水平扩展,manage node中也会分配service,即容器
docker service scale demo=5	# 在某个节点中rm一个容器后,会再重新创建一个容器

# 删掉service
docker service rm demo		# 相应节点中的容器也会删除

# docker run -v的参数相应的为--mount
# 通过overlay的drive创建network可以跨节点通信 docker network create -d overlay demo
# 创建的network不会在worker node中立即出现,分配service至节点后才有
docker service creat --name mysql ... --network demo --mount type=volume,source=mysql-data(本地volume名字),destination=/var/lib/mysql mysql
# 不同节点上的service链接到了同一个网络中,可以通过service名字相互访问.如果是某个service所在节点中的容器中ping另外一个service名字,无论scale多个,ip地址是同一个,即为VIP(virtual ip)

# 查看service如whoami的 dns服务器 & 各个节点中容器真正的ip(进入容器中查看)
nslookup tasks.whoami
```

### 6.1 集群服务间通信之routing mesh

Internal

Ingress

## 7.kubernetes

Master节点 和 Node节点

pod: 具有相同namespace(主要是network namespace)的container的组合

kubectl context: cli连接apiserver的配置信息

### kubrnets架构

![image-20200531135038253](/Users/jasonhuang/Library/Application Support/typora-user-images/image-20200531135038253.png)
### 环境搭建

1.minikube

下载环境

[minikube]:https://github.com/kubernetes/minikube
[kubectl]:https://kubernetes.io/docs/tasks/tools/install-kubectl/

```bash
# 创建k8s虚机
minikube start
# 查看虚机状态
minikube status
# 查看上下文
minikube config view
# 进入虚机
minikube ssh
minikube version，# 查看minikube的版本
minikube start，# 启动minikube
minikube logs，# 显示minikube的log
minikube dashboard，# 启动minikube dashboard
minikube ip，# 显示虚拟机地址
minikube stop，# 停止虚拟机
minikube delete，# 删除虚拟机,start失败时执行此命令
```

2.kubeadm

### 常用命令

```bash
# 获取contexts列表,返回的namespace默认为空，即default
kubectl config get-contexts
# 获取当前上下文
kubectl config current-context
# 获取节点列表
kubectl get node/no
# 切换context上下文
kubectl config use-context [name]
# 创建context,切换context后对pod进行的操作只会显示当前context下的pod信息
kubectl config set-context [name] --user=minikube --cluster=minikube --namespace=demo
# 删除context
kubectl config delete-context [names]
# 获取集群信息
kubectl clustar-info
# 查看config配置文件
kubectl config view

# 查看节点
kubectl get node		
# --show-labels 显示节点label
# 返回的ROLES是特殊的label，可以主动设置，普通节点默认为none

# 设置lable
kubectl label node [node name] env=test
# 删除label
kubectl label node [node name] env-
# 查看节点信息
kubectl describe node [node name]
```

### k8s最小调度单位Pod

一个pod可以包含多个container,共享一个namespace,包括用户,网络,存储等,以及物理资源。之间的通信直接走localhost

![image-20200530222754313](/Users/jasonhuang/Library/Application Support/typora-user-images/image-20200530222754313.png)

#### 操作pod常用命令

```bash
# 根据yml文件中定义的类型创建相应的resource
kubectl create -f [yml文件]
# 更新resourece
kubectl apply -f [yml文件]
# 删除resource
kubectl delete -f [yml文件]

# 查看pod,READY 2/2表示pod中ready的容器/容器总数，age：已运行时间
# -o wide返回更详细的列表, json/yaml返回相应格式
# --namespace [namespace] 过滤相应命名空间下的pod.默认列举default下的pod， --all-namespace列举所有
kubectl get pods/pod ([name])

# 查看pod信息
kubectl describe po [pod name]

# 交互式的进入pod容器内,如果多个容器,默认进入第一个容器,-c指定容器
kubectl exec -it [pod name] sh
# 查看pod日志,检查报错
kubectl logs [pod name]
```

#### pod的定义

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-busybox		# pod name
spec:			# 一个pod
  containers:
  - name: nginx
    image: nginx	# 可以从指定域名下的registry拉取镜像
    imagePullPolicy: # Always: 总是拉取镜像；IfNotPresent: 本地有则使用；Never: 总是使用本地
    namespace: # 默认分配到default中
    ports:
    - containerPort: 80
  - name: busybox
    image: busybox
    command: ["/bin/sh"]
    args: ["-c", "while true; do echo hello; sleep 10;done"]
```

### Namespace命名空间
- ###### 不同命名空间中可以有相同名称的pod存在

```bash
# 获取存在的namespace
$ kubectl get namespace

# 创建namespace
$ kubectl create namespace [name]
```

##  8.Deployment

部署无状态应用

实际上纯pod无法保证稳定的运行，无法对异常做出处理.controller会根据异常情况自动重启或新建pod，使]]]ppcurrent=desired

```yaml
apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: nginx-deployment		# deployment name
spec:
  selector:			# 根据label去匹配
    matchLabels:
      app: nginx
  replicas: 2 # tells deployment to run 2 pods matching the template
  template: # create pods using pod definition in this template
    metadata:
      # unlike pod-nginx.yaml, the name is not included in the meta data as a unique name is
      # generated from the deployment name
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
```

```bash
$ kubectl get pod -l app=nginx # 列举出label是app=nginx的pod
$ kubectl get deployment [name] # -o wide json等
$ kubectl describe deployment ([name])
# 返回的NewReplicaSets 表示关于水平扩展的信息，可以通过kubectl get replicaset看到，如果有镜像更新等，此name会发生变化，扩展时不会改变name

# 删除pod
$ kubectl delete pod [pod name]
# 查看deployment版本更新历史，默认只保存两个版本；--version [version]查看指定version的信息
$ kubectl rollout history deployment nginx-deployment
# 版本回退， --to-version [version]回到指定版本
$ kubectl rollout undo deployment nginx-deployments
```

update deployment的方法

- kubectl aply

- kubectl edit
- kubectl set image, kubectl scale等命令



## 9.容器监控

```bash
# 查看容器的进程信息
$ docker top [container id]
$ docker stats
# 实时查看后台运行中容器系统占用状态
```


