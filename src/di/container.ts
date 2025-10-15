import 'reflect-metadata';
import { Container } from 'inversify';
import { infrastructureModule } from './modules/infrastructure.module';
import { authModule } from './modules/auth.module';
// Future: import { jobModule } from './modules/job.module';

const container = new Container();

// Load modules
container.load(infrastructureModule);
container.load(authModule);
// Future: container.load(jobModule);

export { container };
