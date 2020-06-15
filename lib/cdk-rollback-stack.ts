import { Alarm, ComparisonOperator } from "@aws-cdk/aws-cloudwatch";
import {
  LambdaApplication,
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "@aws-cdk/aws-codedeploy";
import { Alias, Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { Construct, RemovalPolicy, Stack, StackProps } from "@aws-cdk/core";

export class CdkRollbackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaApplication = new LambdaApplication(this, "LambdaApplication", {
      applicationName: "LambdaApplication",
    });

    const lambdaVersionNumber = new Date().toISOString();

    const lambdaFunction = new Function(this, "LambdaFunction", {
      code: Code.fromInline(
        `exports.handler = async () => { return { version: process.env.LAMBDA_VERSION}; }`
      ),
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
      environment: {
        LAMBDA_VERSION: lambdaVersionNumber,
      },
      handler: "index.handler",
      runtime: Runtime.NODEJS_12_X,
    });

    const lambdaVersion = lambdaFunction.addVersion(lambdaVersionNumber);

    const lambdaAlias = new Alias(this, "LambdaAlias", {
      aliasName: "LambdaAlias",
      version: lambdaVersion,
    });

    new LambdaDeploymentGroup(this, "LambdaDeploymentGroup", {
      alarms: [
        new Alarm(this, "LambdaDeploymentGroupErrorsAlarm", {
          comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
          evaluationPeriods: 1,
          metric: lambdaAlias.metricErrors(),
          threshold: 1,
        }),
      ],
      alias: lambdaAlias,
      application: lambdaApplication,
      deploymentConfig: LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }
}
