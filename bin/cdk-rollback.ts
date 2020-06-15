#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { CdkRollbackStack } from "../lib/cdk-rollback-stack";

const app = new App();

new CdkRollbackStack(app, "CdkRollbackStack");
