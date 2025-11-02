import { Container } from 'inversify';
import { infrastructureModule } from './modules/infrastructure.module';
import { authModule } from './modules/auth.module';
import { profileModule } from './modules/profile.module';
import { fileModule } from './modules/file.module';
import { adminModule } from './modules/admin.module';
// Future: import { jobModule } from './modules/job.module';

const container = new Container();

// Load modules
container.load(infrastructureModule);
container.load(authModule);
container.load(profileModule);
container.load(fileModule);
container.load(adminModule);
// Future: container.load(jobModule);

export { container };
