# openblock-resource-loongson

[![Publish npm package](https://github.com/openblockcc/openblock-resource/actions/workflows/publish.yml/badge.svg)](https://github.com/openblockcc/openblock-resource/actions/workflows/publish.yml)
![GitHub](https://img.shields.io/github/license/openblockcc/openblock-resource)

Provide a local resource server for openblock.

## Instructions

- Start resource server

  ```bash
  npm install
  npm run fetch
  npm start
  ```
- Test update funciton, run:

  ```bash
  npm test
  ```

## 部署到loongbian

#### 直接用源文件部署

将本项目放在与openblock-bakcend-loongson同一目录下, 更改start.py文件运行即可(当然也可以手动运行)

#### 编译之后再进行部署

- 方法1: clone 本项目到 家目录下

将 npm run build 之后的文件 dist/* 放入 loongbian的目录 ~/extension-server/public中，注意修改start.py文件中的内容

之后在openblock-backend-loongson运行

```
make run 
```

- 方法2: 不想修改直接部署

在Release中有压缩包文件 extension-server.zip: 构造本地服务器的模版，将其 解压到 ~ 目录下即可

打包资源:

```js
npm run build 
```
