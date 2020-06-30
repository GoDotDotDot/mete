# Mete

Mete 是一个通用的脚手架，灵感来自于 Umi Block。

当前脚手架具有以下特性：

- 插件生态支持
- 物料管理支持

## 物料管理

Mete 提供了物料的一些管理命令。通过 `mete material --help` 可以查看支持的命令。

```shell
$ mete material --help
Usage: material <command> [options]

Options:
  -h, --help         display help for command

Commands:
  add [options]      download material
  list [options]     list material
  publish [options]  pubish material command
  help [command]     display help for command

Example call:
  $ mete material publish
```

### publish

`mete material publish`，该命令用于发布一个物料，通过 `mete materail publish --help` 获取使用帮助。

```shell
$ mete material publish --help
Usage: material publish [options]

pubish material command

Options:
  -n, --name <name>      material name.
  -t, --type <type>      materail type, the recommended options type are component, block, scaffold, page.
  --registry <registry>  specify the material registry.
  -h, --help             display help for command

Example call:
  $ mete material publish
```

### add

`mete material add`，该命令用于下载一个物料，通过 `mete material add --help` 获取使用帮助。

```shell
$ mete material add --help
Usage: material add <material name> [options]

download material

Options:
  -d, --dir <directory>   specify the directory that material will download, default value is current work directory.
  -n, --file-name <name>  specify the material name.
  --registry <registry>   specify the material registry.
  -r, --rewrite           rewrite file same name. (default: false)
  -h, --help              display help for command

Example call:
  $ mete material add mete-work-plugin
```

#### 指定下载的目录

默认情况下，物料将会被下载到当前的工作目录下，如果有特殊需求，可通过 `-d` 选项来指定。

#### 指定文件名

默认情况下，物料的名称取的是 `.meterc.js` 里面的 `name` 字段，如需修改名称，可通过 `-n` 选项来指定。

### list

`mete material lis`，该命令用于查询物料列表，可通过 `mete material list --help` 获取帮助信息。

```shell
$ mete material list --help
Usage: material list [options]

list material

Options:
  -t, --type <type>                    specify the type of material.
  -n, --materail-name <materail-name>  specify the name of material. You can specify the version of materail with ":", ex: mete:1.0.1, the default version is latest.
  -T, --tags <tags>                    specify the tags of material, muilt tags split with comma
  --registry <registry>                specify the material registry.
  -h, --help                           display help for command

Example call:
  $ mete material list -t plugin
```

例如：

```shell
$ mete material list -t page --registry=http://127.0.0.1:7001

 NAME              TYPE  VERSION  TAGS                 PUBLISH TIME
 boss-admin-login  page  1.1.3    boss admin,boss api  2020-06-29 16:13:55
 boss-admin-login  page  1.1.4    boss admin           2020-06-29 17:13:19
```

## 插件

mete 支持通过插件来丰富脚手架的能力。

#### 插件钩子

当前支持的插件事件触发钩子有：

##### 解压类

- extractTarball@beforeWrite

该钩子会在解压每个文件并且在写入文件之前触发，可以根据此钩子来重写文件写入的位置。

传入的参数：params: object

```typescript
{
  // 即将写入的文件地址
  path: string,
  // 物料名称
  name: string,
  // 即将写入的目录
  directory: string,
  // 物料类型
  type: string,
  // 版本
  version: string,
  // 拓展名
  ext: string,
  // 物料哈希值
  etag: string;
  // 物料标签
  tags: string[];
  // 文件存储 bucket 名称
  bucketName: string;
  // 文件存储对象名称
  objectName: string;
}
```

- extractTarball@sucess

该钩子会在解压所有文件成功时触发。

传入的参数：params: object

```typescript
{
  // 文件夹名称
  filename: string,
  // 将写入的目录
  directory: extractDirectory,
  // 物料名称，但是该名称是经过 tarballDownload@success 钩子修改过的
  name,
  // 所有的文件数组
  entry,
}
```

- tarballDownload@success

该钩子会在下载物料成功后触发。

传入的参数：params: object

```typescript
{
  // 物料缓存文件地址，一般不需要关心
  filename: string,
  // 物料解压的地址
  directory: string,
  // 物料的新名称，可以在此处修改物料名称
  name,
  // 物料的文件数组
  entry,
}
```

##### 打包类

- packTarball@success

该钩子会在打包物料成功时触发。

传入的参数：dir: string

```typescript
// 临时打包过后的 tgz 文件
dir: string;
```

#### 插件编写

mete 的插件是一个函数，所以编写的时候只需要返回一个函数就行了。

##### 插件 API

- hooks.register(event: string, callback: function)
- hooks.emit(event: string, args: any)
- hooks.emitSync(event: string, args: any)

##### 插件示例

```javascript
module.exports = function Plugin(hooks) {
  hooks.register('extractTarball@beforeWrite', data => {
    let { path } = data;
    const { name, tags } = data;

    if (!tags.find(item => item.toLowerCase() === 'plugin')) {
      return data;
    }

    if (path === 'service.ts') {
      path = `src/service/${name}.ts`;
    } else {
      path = `src/pages/${name}/${path}`;
    }

    return { ...data, path };
  });
};
```
