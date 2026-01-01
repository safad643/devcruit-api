import { Container } from 'inversify';
import { infrastructureModule } from './modules/infrastructure.module';
import { authModule } from './modules/auth.module';
import { profileModule } from './modules/profile.module';
import { fileModule } from './modules/file.module';
import { adminModule } from './modules/admin.module';
import { paymentModule } from './modules/payment.module';
import { planModule } from './modules/plan.module';
import { jobModule } from './modules/job.module';
import { jobFieldModule } from './modules/jobField.module';
import { applicationModule } from './modules/application.module';
import { chatModule } from './modules/chat.module';
import { dashboardModule } from './modules/dashboard.module';
import { notificationModule } from './modules/notification.module';
import { codeExecutionModule } from './modules/codeExecution.module';

const container = new Container();

// Load modules
container.load(infrastructureModule);
container.load(authModule);
container.load(profileModule);
container.load(fileModule);
container.load(adminModule);
container.load(paymentModule);
container.load(planModule);
container.load(jobModule);
container.load(jobFieldModule);
container.load(applicationModule);
container.load(chatModule);
container.load(dashboardModule);
container.load(notificationModule);
container.load(codeExecutionModule);

export { container };
