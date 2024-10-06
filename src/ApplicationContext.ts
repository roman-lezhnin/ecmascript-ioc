import { DiContainer } from "./DiContainer";
/**
 * The central entity that provides more enterprise-specific functionalities:
 * IoC container and configuration properties.
 */
export class ApplicationContext {
  readonly #diContainer: DiContainer = new DiContainer();
  readonly #configurationProperties: Readonly<ConfigurationProperties>;
  /**
   * @param configurationProperties - The object with settings of your app.
   */
  constructor(configurationProperties: ConfigurationProperties = {}) {
    this.#configurationProperties = Object.freeze(configurationProperties);
  }

  get diContainer(): DiContainer {
    return this.#diContainer;
  }

  get configurationProperties(): Readonly<ConfigurationProperties> {
    return this.#configurationProperties;
  }

  /**
   * Marks a class as a component and registers it with the DI container.
   */
  init(): void {
    Object.defineProperty(globalThis, "ecmascript_ioc_application_context", {
      value: Object.freeze(this),
      writable: false,
      configurable: false,
    });
  }
}

export class TestApplicationContext extends ApplicationContext {
  override init(): void {
    globalThis.ecmascript_ioc_application_context = this;
  }
}
