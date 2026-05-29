---
name: api-design
description: RESTful API 与 GraphQL API 设计最佳实践。包含路由设计、状态码、错误处理、认证、版本控制、OpenAPI 规范。当用户设计 API、审查接口或编写 API 文档时使用。
---

# API 设计技能

## 核心原则
1. **面向资源** - URL 是资源，不是动作
2. **使用标准 HTTP 方法** - GET/POST/PUT/PATCH/DELETE
3. **状态码准确** - 不要所有错误都返回 200
4. **版本化** - 从第一天开始考虑版本控制
5. **一致性** - 命名、结构、错误格式全系统统一

## RESTful 路由设计

### 资源命名
```
GET    /users              # 列表
GET    /users/:id          # 详情
POST   /users              # 创建
PUT    /users/:id          # 全量更新
PATCH  /users/:id          # 部分更新
DELETE /users/:id          # 删除
GET    /users/:id/orders   # 子资源
```

### 过滤、排序、分页
```
GET /users?role=admin&sort=-createdAt&page=2&limit=20
```

响应结构：
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

## HTTP 状态码速查

| 状态码 | 场景 |
|--------|------|
| 200 OK | GET/PUT/PATCH 成功 |
| 201 Created | POST 创建成功 |
| 204 No Content | DELETE 成功 |
| 400 Bad Request | 请求参数错误（客户端可修复） |
| 401 Unauthorized | 未认证 |
| 403 Forbidden | 无权限 |
| 404 Not Found | 资源不存在 |
| 409 Conflict | 资源冲突（如重复创建） |
| 422 Unprocessable | 语义错误（如邮箱格式正确但已存在） |
| 429 Too Many Requests | 限流 |
| 500 Internal Error | 服务端错误 |

## 错误响应格式

统一错误结构：
```json
{
  "error": {
    "code": "INVALID_EMAIL_FORMAT",
    "message": "The email format is invalid",
    "field": "email",
    "details": {
      "received": "not-an-email",
      "expected": "valid email address"
    }
  }
}
```

批量错误：
```json
{
  "errors": [
    { "code": "REQUIRED", "message": "Name is required", "field": "name" },
    { "code": "MIN_LENGTH", "message": "Password too short", "field": "password" }
  ]
}
```

## 认证方案

### JWT Bearer Token
```
Authorization: Bearer <eyJhbG...token>
```

- Access Token 短时效（15分钟）
- Refresh Token 长时效（7天），单独端点刷新
- 在 Header 中传输，不在 URL 中

### API Key
```
X-API-Key: ak_live_xxxxxxxx
```

适合服务端到服务端调用。

## 版本控制策略

### URL 路径版本（推荐）
```
/api/v1/users
/api/v2/users
```

### Header 版本
```
Accept: application/vnd.api+json;version=2
```

## OpenAPI 3.0 规范示例

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
```

## GraphQL 设计规范

### Schema 设计
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts(page: PaginationInput): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type Query {
  user(id: ID!): User
  users(filter: UserFilter, page: PaginationInput): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
}
```

### 设计原则
- 使用 `Connection` 模式实现分页
- 输入用 `Input` 后缀，输出用 `Payload` 后缀
-  mutations 使用单一 `input` 参数
- 所有字段默认非空 (`!`)，确实可能为空才去掉

## 安全性 checklist
- [ ] 所有端点都有认证（除了公开端点）
- [ ] 使用 HTTPS
- [ ] 防 SQL/NoSQL 注入（用参数化查询）
- [ ] 防 XSS（转义输出）
- [ ] 速率限制 (Rate Limiting)
- [ ] CORS 白名单配置
- [ ] 敏感操作需要二次确认或审计日志
- [ ] 不暴露内部错误详情给客户端
