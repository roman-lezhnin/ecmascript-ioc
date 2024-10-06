import { TestApplicationContext, autowired, service, repository } from "..";

describe("Container base tests", () => {
  const context = new TestApplicationContext();
  context.init();

  beforeEach(() => {
    context.diContainer.clear();
  });

  const IoC = {
    repository: Symbol.for("UserRepository"),
    service: Symbol.for("UserService"),
  };

  @repository(IoC.repository)
  class UserRepository {
    get(): string {
      return "username";
    }

    save(username: string): void {
      console.log(`Persist user: ${username}.`);
    }
  }

  @service(IoC.service)
  class UserService {
    @autowired(IoC.repository)
    repository!: UserRepository;

    getUser(): string {
      return this.repository.get();
    }

    createUser(username: string): void {
      this.repository.save(username);
    }
  }

  it("should correctly inject dependencies", () => {
    const userService = context.diContainer.getDependency<UserService>(
      IoC.service
    );
    expect(userService).toBeInstanceOf(UserService);
    expect(userService.repository).toBeInstanceOf(UserRepository);
  });

  it("should correctly override component", () => {
    class OverridedUserService {
      @autowired(IoC.repository)
      repository!: UserRepository;

      getUser(): string {
        return this.repository.get();
      }

      createUser(username: string): void {
        this.repository.save(username);
      }
    }

    const userService = context.diContainer.getDependency<UserService>(
      IoC.service
    );
    expect(userService).toBeInstanceOf(UserService);
    expect(userService.repository).toBeInstanceOf(UserRepository);

    context.diContainer.overrideDependency(IoC.service, OverridedUserService, {
      lazy: false,
      scope: "Singleton",
    });
    const overridedUserService =
      context.diContainer.getDependency<OverridedUserService>(IoC.service);
    expect(overridedUserService).toBeInstanceOf(OverridedUserService);
    expect(overridedUserService.repository).toBeInstanceOf(UserRepository);
  });

  it("should throw an error when registering a component that is already registered", () => {
    expect(() => {
      context.diContainer.registerDependency(IoC.service, UserService, {
        lazy: false,
        scope: "Singleton",
      });
    }).toThrow(`Dependency '${IoC.service.toString()}' is already registered.`);
  });

  it("should throw an error if a component is not registered", () => {
    expect(() =>
      context.diContainer.getDependency("NonExistentComponent")
    ).toThrow("Dependency 'NonExistentComponent' not found.");
  });
});
