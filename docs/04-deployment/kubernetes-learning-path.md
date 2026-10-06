# Kubernetes 学习实验：从零开始

> 目标：不影响正式 Ubuntu VM 的前提下，在 Windows 本地练习 Kubernetes 基础操作。
>
> 当前建议：正式环境继续使用 Ubuntu VM + Docker Compose；Kubernetes 先作为独立学习环境。不要把生产数据库卷迁移到本实验。
>
> 命令默认在 Windows PowerShell 执行。每条命令后的 `#` 是说明，不需要删除即可执行。

## 0. 学习边界

第一阶段只练习：

- `kubectl` 基本查询。
- Namespace。
- Pod、Deployment、Service。
- ConfigMap、Secret。
- readiness/liveness 探针。
- 删除 Pod 自动恢复。
- 滚动更新和回滚。
- 日志和故障定位。

第一阶段不练习：

- 把 PostgreSQL、Redis、MinIO 直接搬进集群。
- 使用正式环境密码和令牌。
- 让本地 Kubernetes 访问正式数据库。
- 删除正式环境 Docker volume。

## 1. 安装 Docker Desktop

如果尚未安装，先完成：`docs/03-development/windows-local-development.md` 的 WSL 2 和 Docker Desktop 步骤。

验证：

```powershell
docker version # 查看 Docker 客户端和服务端版本；两部分都出现才表示引擎可用
docker compose version # 检查 Compose Plugin 是否可用
```

## 2. 启用 Docker Desktop Kubernetes

1. 打开 Docker Desktop。
2. 进入 `Settings`。
3. 打开 `Kubernetes`。
4. 勾选 `Enable Kubernetes`。
5. 点击 `Apply & Restart`。
6. 等待状态显示 Kubernetes running。

安装或确认 `kubectl`：

```powershell
kubectl version --client # 只检查 kubectl 客户端；不代表集群已启动
kubectl config current-context # 查看当前 kubectl 上下文；Docker Desktop 模式应为 docker-desktop
kubectl get nodes # 查询集群节点；STATUS 应为 Ready
```

成功标准：`kubectl get nodes` 至少返回一个 `Ready` 节点。

如果上下文不是 Docker Desktop：

```powershell
kubectl config get-contexts # 列出所有上下文，并查看当前星号位置
kubectl config use-context docker-desktop # 切换到 Docker Desktop 集群
```

## 3. 创建练习 Namespace

```powershell
kubectl create namespace orderlydesk-lab # 创建独立练习空间；避免污染 default namespace
kubectl config set-context --current --namespace=orderlydesk-lab # 让当前上下文默认使用练习空间
kubectl get namespace # 查看 namespace；应看到 orderlydesk-lab
```

如果 namespace 已存在，`AlreadyExists` 可以忽略；它表示之前已经创建过。

## 4. 部署第一个 Nginx 实验

创建文件：

```powershell
New-Item -ItemType Directory -Force .\infra\kubernetes\lab | Out-Null # 创建实验清单目录
```

把下面内容保存为 `infra/kubernetes/lab/web-demo.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web-demo
  template:
    metadata:
      labels:
        app: web-demo
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          ports:
            - name: http
              containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 2
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: web-demo
spec:
  selector:
    app: web-demo
  ports:
    - port: 80
      targetPort: http
  type: ClusterIP
```

应用清单：

```powershell
kubectl apply -f .\infra\kubernetes\lab\web-demo.yaml # 创建或更新 Deployment 和 Service
kubectl get deployment,pod,service # 查看副本、Pod 和服务是否生成
kubectl rollout status deployment/web-demo # 等待 Deployment 完成滚动发布
```

成功标准：

- `web-demo` Deployment 显示 `2/2` ready。
- 两个 Pod 显示 `Running`。
- Service 显示 `ClusterIP`。

## 5. 从本机访问 Service

`ClusterIP` 只在集群内部可访问，使用端口转发：

```powershell
kubectl port-forward service/web-demo 8088:80 # 把本机 8088 转发到 Service 80；保持此窗口打开
```

另开 PowerShell：

```powershell
Invoke-WebRequest http://127.0.0.1:8088 # 请求 Nginx 首页；预期 HTTP 200
```

浏览器访问 `http://127.0.0.1:8088`。结束端口转发时，在原窗口按 `Ctrl+C`。

## 6. 学习 ConfigMap 和 Secret

创建配置和练习令牌：

```powershell
kubectl create configmap web-demo-config --from-literal=APP_ENV=lab # 保存非敏感配置
kubectl create secret generic web-demo-secret --from-literal=ADMIN_TOKEN=lab-only-token # 保存练习敏感值；禁止使用正式令牌
kubectl get configmap web-demo-config # 检查 ConfigMap 是否存在
kubectl get secret web-demo-secret # 只看 Secret 名称，不把值打印到终端
```

查看 Secret 的键名但不解码值：

```powershell
kubectl describe secret web-demo-secret # 查看元数据和键名；不要把输出粘贴到公开位置
```

## 7. 验证 Pod 自动恢复

```powershell
kubectl get pods -l app=web-demo # 找到一个 web-demo Pod 名称
kubectl delete pod <pod名称> # 删除一个 Pod；Deployment 应自动创建替代 Pod
kubectl get pods -l app=web-demo -w # 持续观察新 Pod；看到 2 个 Running 后按 Ctrl+C
```

成功标准：删除单个 Pod 后，Deployment 最终仍恢复到 2 个可用副本。

## 8. 验证滚动更新和回滚

更新镜像：

```powershell
kubectl set image deployment/web-demo web=nginx:1.27.1-alpine # 修改 Deployment 镜像标签，触发滚动更新
kubectl rollout status deployment/web-demo # 等待更新完成
kubectl rollout history deployment/web-demo # 查看发布历史
```

模拟回滚：

```powershell
kubectl rollout undo deployment/web-demo # 回滚到上一个稳定版本
kubectl rollout status deployment/web-demo # 确认回滚完成
kubectl get pods -l app=web-demo -o wide # 确认 Pod 已恢复且节点正常
```

## 9. 练习日志和故障定位

```powershell
kubectl logs deployment/web-demo --tail=100 # 查看 Deployment 当前 Pod 的最近日志
kubectl describe deployment web-demo # 查看副本、事件和滚动更新信息
kubectl describe pod <pod名称> # 查看单个 Pod 的探针、挂载、事件和调度结果
kubectl get events --sort-by=.lastTimestamp # 按时间查看 namespace 内事件
```

常见状态：

- `ImagePullBackOff`：镜像名、网络或镜像仓库权限问题。
- `CrashLoopBackOff`：容器启动后反复退出，先查 `kubectl logs`。
- `0/1 Ready`：readinessProbe 未通过，检查路径、端口和依赖。
- `Pending`：资源不足、节点不可用或 PVC 无法绑定。

## 10. 连接到 OrderlyDesk 的学习顺序

不要一开始把 Compose 全部转换为 Kubernetes。推荐顺序：

1. 先把 Web 镜像做成 Deployment + Service。
2. 再把 API 镜像做成 Deployment + Service。
3. 用 ConfigMap 注入非敏感配置。
4. 用 Secret 注入 `ADMIN_TOKEN` 和数据库连接串。
5. 给 API 配置 `/api/health/live` livenessProbe。
6. 给 API 配置 `/api/health/ready` readinessProbe。
7. 数据库先继续使用 Compose 或独立服务。
8. 最后再学习 Ingress，把 `/` 转发到 Web，把 `/api` 转发到 API。

Kubernetes 更适合拉取已经构建好的版本化镜像；成熟发布链路应为：

```text
git push → CI 测试 → CI 构建镜像 → 推送镜像仓库 → 更新 Kubernetes image tag
```

## 11. 清理练习环境

```powershell
kubectl delete -f .\infra\kubernetes\lab\web-demo.yaml # 删除本实验创建的 Deployment 和 Service
kubectl delete configmap web-demo-config # 删除练习 ConfigMap
kubectl delete secret web-demo-secret # 删除练习 Secret
kubectl delete namespace orderlydesk-lab # 删除整个练习 namespace；确认里面没有需要保留的资源
kubectl config set-context --current --namespace=default # 把默认 namespace 切回 default
```

> `kubectl delete namespace` 会删除 namespace 内全部资源。只对学习 namespace 执行，不要对生产 namespace 执行。

## 12. Kubernetes 阶段完成标准

- 能解释 Pod、Deployment、Service 的关系。
- 能创建并查询 Namespace、ConfigMap、Secret。
- 能使用端口转发访问 ClusterIP Service。
- 删除 Pod 后能观察到自动恢复。
- 能完成一次滚动更新和回滚。
- 能用 `logs`、`describe`、`events` 定位基础故障。
- 能说明为什么当前不把 PostgreSQL、Redis、MinIO 直接迁入学习集群。
