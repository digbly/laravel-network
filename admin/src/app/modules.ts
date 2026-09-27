import { registerModules } from './registry';
import { authModule } from '../modules/auth/module';
import { blogModule } from '../modules/blog/module';
import { adminModule } from '../modules/admin/module';
import { networkModule } from '../modules/network/module';
import { menusModule } from '../modules/menus/module';

registerModules([authModule, adminModule, networkModule, blogModule, menusModule]);
