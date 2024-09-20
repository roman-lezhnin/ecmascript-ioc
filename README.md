# ecmascript-ioc

An IoC library mirroring Java Spring Framework's implementation.

## Features

- **Annotations**: Use decorators like `@component`, `@repository`, `@service`, `@controller`, and `@autowired`.
- **Dependency Injection**: Automatic dependency resolution and injection with circular dependencies handling and lazy initializations.
- **TypeScript 5.0 Decorators**: Uses the new ECMAScript decorators without `reflect-metadata`.

## Installation

```bash
npm install ecmascript-ioc
```

## Usage guide

```TypeScript
import { autowired, component, service, repository, postConstruct } from 'ecmascript-ioc';

@component("ReportGenerator", { lazy: true })
class ReportGenerator {
  public generateTaxReport(username: string): void {
    console.log(`Prepare tax report for user: ${username}.`);
  }
}

@repository("UsersRepository")
class UsersRepository {
  public get(): string {
    return "username";
  }

  public save(username: string): void {
    console.log(`Persist user: ${username}.`);
  }

  @postConstruct
  private warmUpCache(): void {
    console.log('Fetching data from DataBase...');
  }
}

@service("UsersService")
class UsersService {
  @autowired("UsersRepository")
  private repository!: UsersRepository;

  @autowired("ReportGenerator")
  private reportGenerator!: ReportGenerator;

  public getUser(): string {
    return this.repository.get();
  }

  public createUser(username: string): void {
    this.repository.save(username);
  }

  private generateTaxReport(username: string): void {
    this.reportGenerator.generateTaxReport(username);
  }
}
```
