# ecmascript-ioc

This is a zero-dependency vanila TypeScript IoC library that mirrors the implementation of the Java Spring Framework IoC.
You can use it anywhere: Node.js backend, Electron.js, IoT apps, React/ReactNative, Vue, Iframe embeded widgets, etc...

## Features

- **Dependency Injection**: Automatic dependency resolution and injection with scopes, circular dependencies handling and lazy initializations.
- **Annotations**: Use decorators like `@component`, `@repository`, `@service`, `@controller`, and `@autowired`.
- **New ECMAScript Decorators**: Use the native TypeScript5.0 decorators without `reflect-metadata`.

## Installation

```bash
npm install ecmascript-ioc
```

## Dependency settings

All dependency definition decorators have a common signature: you define the required dependency name and optional settings.

```TypeScript
type DependencySettings = {
  lazy: boolean;
  scope: "Singleton" | "Prototype";
};

function component(name: string | symbol, settings?: Partial<DependencySettings>);
```

```TypeScript
const defaultSettings: DependencySettings = {
  lazy: false,
  scope: "Singleton";
};
```

## Usage guides

### Create and init ApplicationContext before usage:

```TypeScript
import { ApplicationContext } from 'ecmascript-ioc';

const applicationContext = new ApplicationContext({...configurationProperties});
applicationContext.init();
```

### Backend Three-tier architecture example:

```TypeScript
import { autowired,
         component,
         repository,
         service,
         controller,
         postConstruct } from 'ecmascript-ioc';


@component(ReportGenerator.di_token, { lazy: true })
class ReportGenerator {
  static readonly di_token = Symbol.for("ReportGenerator");

  public generateTaxReport(username: string): void {
    console.log(`Prepare tax report for user: ${username}.`);
  }
}


@repository("UsersRepository")
class UsersRepository extends Repository {
  public delete(username: string): void {
    console.log(`Delete user: ${username} from DataBase.`);
  }

  @postConstruct
  private warmUpCache(): void {
    console.log('Fetching data from DataBase...');
  }
}


@service("UsersService")
class UsersService implements Service {
  @autowired("UsersRepository")
  private readonly repository!: UsersRepository;

  @autowired(ReportGenerator.di_token)
  private readonly reportGenerator!: ReportGenerator;

  public deleteUser(username: string): void {
    this.repository.delete(username);
    this.reportGenerator.generateTaxReport(username);
  }
}


@controller("UsersController")
class UsersController {
  @autowired("UsersService")
  private readonly service!: UsersService;

  public deleteUser(req: Request, res: Response) {
    this.service.deleteUser(req.query.username);
  }
}
```

### Frontend Three-tier architecture example:

```TypeScript
import React from "react";
import { AxiosInstance } from "axios";
import { observable, action } from "mobx";
import { autowired, component, repository, service } from 'ecmascript-ioc';


@component("RestHttpClient")
export class RestHttpClient extends HttpClient {
  protected readonly http: AxiosInstance;

  public delete(url: string): void {
    console.log(`RESTful: ${url}.`);
  }
}


@repository("UsersRepository")
export class UsersRepository extends Repository {
  @autowired("RestHttpClient")
  private readonly http!: RestHttpClient;

  public deleteUser(username: string): void {
    return this.http.delete(`/users?username=${username}`);
  }
}


@service("UsersService", { scope: 'Prototype' })
export class UsersService extends Service {
  @autowired("UsersRepository")
  private readonly repository!: UsersRepository;

  @observable accessor username: string = "";

  @action
  public setUsername(username: string): void {
    this.username = username;
  }

  public deleteUser(): void {
    return this.repository.delete(this.username);
  }
}


export function View(): JSX.Element {
  const service = useDependency<UsersService>("UsersService");
  return <div>Loading..<div/>;
}
```

## React.js hook

```TypeScript
import { useMemo } from "react";
import { Container } from "ecmascript-ioc";

export function useDependency<T>(dependencyName: string | symbol): T {
  return useMemo(() => {
    return Container.get<T>(dependencyName);
  }, [dependencyName]);
}
```
