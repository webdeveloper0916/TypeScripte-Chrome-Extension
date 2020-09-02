# CloudBase CMS

CloudBase CMS 是云开发推出的开源的、综合性内容数据管理运营平台，提供了丰富的内容管理功能，可扩展性强，易于二次开发，并支持 API 访问。支持在云开发控制台一键安装到已有的环境中，随时随地管理小程序 / Web 等多端产生的内容数据。无须编写代码即可使用，支持文本、富文本、Markdown、图片、文件、关联类型等多种类型的可视化编辑。

## 功能特性

| 特性        | 介绍                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| 免开发      | 基于模板配置生成内容管理界面，无须编写代码                                 |
| 功能丰富    | 支持文本、图片、文件、枚举等多种类型内容的可视化编辑，并且支持内容关联     |
| 权限控制    | 基于自定义角色的资源级权限管理，满足企业级需求                             |
| 系统集成    | 支持 Webhook 触发，可以方便的与外部系统集成                                |
| 数据源兼容  | 支持管理已有的云开发数据，也可以在 CMS 后台创建新的内容和数据集合          |
| 部署简单    | 可在云开发控制台扩展管理界面一键部署和升级，也可通过项目提供的脚本自动部署 |
| RESTful API | 支持通过 RESTful API 操作内容数据                                          |

## 使用场景

#### 1. 适用于需要为小程序应用增加一个运营管理后台的业务

CMS 扩展非常适合小程序的商品管理、文章编辑和发布、运营活动配置、素材管理等数据和内容管理的场景。使用 CMS 扩展，可以省去手动线上修改数据库数据或者投入人力物力开发管理后台的麻烦，只需要安装之后进行一些简单的配置，就可以随时随地使用 CMS 内容管理系统来管理内容，同时还提供了管理员和运营者的两套身份体系的权限控制。

#### 2. 适用于快速开发内容型的网站应用、小程序应用的场景

CMS 扩展还可以用来配合开发网站应用和小程序应用，提升开发效率。使用 CMS 扩展可以解决内容和数据的管理和生产问题，并且省去一部分后端开发工作，直接可以结合前端应用框架读取云开发数据库数据进行渲染。例如基于 CMS 可以快速开发博客、企业官网等内容型的网站、小程序应用。

## 工作原理

::: tip
使用 CMS 扩展时将在当前环境创建云函数、云数据库等资源，查询 [部署详情](./intro.md)。
:::

![](https://main.qcloudimg.com/raw/af882d4cb9d5262efe7cc1ee05ae3659.png)

## 常见问题

### 在扩展管理界面找不到 CMS 扩展？

CMS 扩展会开通静态托管资源，静态托管目前仅支持在按量计费环境下开通，切换为按量计费后就可以安装 CMS 扩展

### 打开 CMS 时提示 404？

CMS 的安装路径是是静态托管默认域名/tcb-cms/, 可以看下地址是否正确

### 使用管理员账号提示没有管理权限怎么办？

管理员和运营者账号不能相同，建议设置为不同的账号，可以在扩展管理界面重新修改用户名进行修复

### 登录报错，提示 No credentials found on headers or cookies 怎么处理？

用户打开了云函数的 HTTP 触发的访问鉴权功能，开启鉴权后，客户端需要在登录的情况下才能触发云函数。
CMS 负责登录的 auth 云函数需要关闭访问鉴权才可以使用。

## 其他

### 扩展配置信息

您可以配置以下参数：

- 管理员账号：CMS 内容管理系统的管理员账号。
- 管理员密码：CMS 内容管理系统的管理员密码。
- 运营者账号：CMS 内容管理系统的运营者账号。
- 运营者密码：CMS 内容管理系统的运营者密码。
- 部署路径：CMS 内容管理系统的部署路径。

### 计费

此扩展使用其他云开发或其他腾讯云服务，可能会产生相关费用：

- 云开发（[产品定价](https://buy.cloud.tencent.com/price/tcb) 及 [使用明细](https://console.cloud.tencent.com/tcb)）。
- 静态托管（[产品定价](https://buy.cloud.tencent.com/price/tcb) 及 [使用明细](https://console.cloud.tencent.com/tcb)）。

当您使用云开发扩展时，您只需要为您使用的云资源付费。云开发与云上其他资源分开计费，您可以在 [费用中心](https://console.cloud.tencent.com/expense/bill/overview) 查看具体信息。

### 权限授予

#### 主账户

该扩展能力使用云开发自有资源即可完成，无需再授予其他权限。

#### 子账户

如果想让子账户也能使用该扩展，需要为子账户授予如下权限才能使用：

- **策略:** QcloudAccessForTCBRole。
  **描述:** 云开发（TCB）对云资源的访问权限。