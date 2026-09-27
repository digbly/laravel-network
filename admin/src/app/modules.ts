import { registerModules } from './registry';
import { authModule } from '../modules/auth/module';
import { blogModule } from '../modules/blog/module';
import { adminModule } from '../modules/admin/module';

registerModules([authModule, adminModule, blogModule]);
