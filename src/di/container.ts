import { Container } from 'inversify';
import { infrastructureModule } from './modules/infrastructure.module';
import { authModule } from './modules/auth.module';
import { profileModule } from './modules/profile.module';
import { fileModule } from './modules/file.module';
import { adminModule } from './modules/admin.module';
import { paymentModule } from './modules/payment.module';
import { jobModule } from './modules/job.module';
import { applicationModule } from './modules/application.module';
import { chatModule } from './modules/chat.module';

const container = new Container();

// Load modules
container.load(infrastructureModule);
container.load(authModule);
container.load(profileModule);
container.load(fileModule);
container.load(adminModule);
container.load(paymentModule);
container.load(jobModule);
container.load(applicationModule);
container.load(chatModule);

export { container };
