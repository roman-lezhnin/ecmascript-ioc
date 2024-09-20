# ecmascript-ioc

An IoC library mirroring Java Spring Framework's implementation.

## Features

- **Annotations**: Use decorators like `@component`, `@repository`, `@service`, `@controller`, and `@autowired`.
- **Dependency Injection**: Automatic dependency resolution and injection.
- **TypeScript 5.0 Decorators**: Uses the new ECMAScript decorators without `reflect-metadata`.

## Installation

```bash
npm install ecmascript-ioc
```

## Usage guide

```TypeScript
import { autowired, service, repository } from 'ecmascript-ioc';

@repository("UserRepository")
class UserRepository {
  public get(): string {
    return "username";
  }

  public save(username: string): void {
    console.log(`Persist user: ${username}.`);
  }
}

@service("UserService")
class UserService {
  @autowired("UserRepository")
  private repository!: UserRepository;

  public getUser(): string {
    return this.repository.get();
  }

  public createUser(username: string): void {
    this.repository.save(username);
  }
}
```
