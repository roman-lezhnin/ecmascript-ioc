/* eslint-disable no-var */
import { type ApplicationContext } from "./ApplicationContext";

declare global {
  declare var ecmascript_ioc_application_context: Readonly<ApplicationContext>;
}
