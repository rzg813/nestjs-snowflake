# Snowflake

- 推荐使用 `Node.js 16.x`
- 服务器的系统时间不允许小于当前时间

## 安装

```
yarn add nestjs-snowflake
```

## 使用方法生成

```
import * as Snowflake from 'nestjs-snowflake';

const snowflake = new Snowflake();

let id = snowflake.nextId();
console.log('18位长度ID为：'+ id);
```

