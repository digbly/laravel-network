import { registerModules } from './registry';
import { authModule } from '../modules/auth/module';
import { dashboardModule } from '../modules/dashboard/module';
import { usersModule } from '../modules/users/module';
import { settingsModule } from '../modules/settings/module';
import { websitesModule } from '../modules/websites/module';

registerModules([authModule, dashboardModule, usersModule, settingsModule, websitesModule]);
