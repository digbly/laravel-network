import { registerModules } from './registry';
import { authModule } from '../modules/auth/module';
import { blogModule } from '../modules/blog/module';
import { dashboardModule } from '../modules/dashboard/module';
import { usersModule } from '../modules/users/module';
import { settingsModule } from '../modules/settings/module';
import { networkModule } from '../modules/network/module';

registerModules([authModule, dashboardModule, usersModule, settingsModule, networkModule, blogModule]);
