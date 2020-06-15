import "@aws-cdk/assert/jest";
import { App } from "@aws-cdk/core";
import { CdkRollbackStack } from "../cdk-rollback-stack";

let stack: CdkRollbackStack;

beforeAll(() => {
  const app = new App();

  stack = new CdkRollbackStack(app, "CdkRollbackStack");
});

test("Stack has no resources", () => {
  expect(stack).toMatchTemplate({
    Resources: {},
  });
});
